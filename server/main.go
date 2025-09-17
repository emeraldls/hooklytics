package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"time"

	"github.com/emeraldls/hooklytics/types"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/lestrrat-go/jwx/v3/jwk"
	"github.com/lestrrat-go/jwx/v3/jwt"

	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

var clickhouseConn driver.Conn

func main() {
	_ = godotenv.Load(".env")
	router := http.NewServeMux()

	router.HandleFunc("/home", testHandler)
	// router.Handle("/api/auth/verify", http.HandlerFunc(testHandler))
	// router.Handle("/api/me", http.HandlerFunc(verifyAuthHandler))

	// Enable CORS

	handler := cors.AllowAll().Handler(router)
	fmt.Println("server is runnig")
	if err := http.ListenAndServe(":5555", handler); err != nil {
		log.Fatal("Server failed to start:", err)
	}

}

func testHandler(w http.ResponseWriter, r *http.Request) {
	_, err := VerifyToken(r)
	if err != nil {
		http.Error(w, err.Error(), 500)
	}

}

func handleEvents(c *fiber.Ctx) error {

	return nil
	var events []types.Event

	if err := c.BodyParser(&events); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	jsonData, _ := json.MarshalIndent(events, "", " ")
	fmt.Println(string(jsonData))

	batch, err := clickhouseConn.PrepareBatch(context.Background(), `
	INSERT INTO event_log (
		userId,
		websiteId,
		hookType,
		eventType,
		defaultMetadata,
		coreMetadata,
		elementMetadata,
		timestamp
	)
`)

	if err != nil {
		log.Println("Batch error:", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	for _, e := range events {
		defaultMetadata, err := json.Marshal(e.DefaultMetadata)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		coreMetadata, err := json.Marshal(e.CoreMetadata)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		elementMetadata, err := json.Marshal(e.ElementMetadata)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": err.Error(),
			})
		}

		hookType := e.HookType
		eventType := e.EventType
		userId := e.UserId
		websiteId := e.WebsiteId
		timestamp := time.UnixMilli(e.Timestamp)

		err = batch.Append(userId, websiteId, hookType, eventType, defaultMetadata, coreMetadata, elementMetadata, timestamp)

		if err != nil {
			log.Println("Append error:", err)
			return c.SendStatus(fiber.StatusInternalServerError)
		}
	}

	if err := batch.Send(); err != nil {
		log.Println("Send error:", err)
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	return c.JSON(fiber.Map{
		"message": fmt.Sprintf("%d events logged successfully", len(events)),
	})
}

func getConn() (driver.Conn, error) {

	var CLICKHOUSE_SECURE_NATIVE_HOSTNAME = os.Getenv("CLICKHOUSE_SECURE_NATIVE_HOSTNAME")
	var CLICKHOUSE_SECURE_NATIVE_PASSWORD = os.Getenv("CLICKHOUSE_SECURE_NATIVE_PASSWORD")
	var CLICKHOUSE_SECURE_NATIVE_PORT = os.Getenv("CLICKHOUSE_SECURE_NATIVE_PORT")
	var CLICKHOUSE_SECURE_NATIVE_DATABASE = os.Getenv("CLICKHOUSE_SECURE_NATIVE_DATABASE")
	var CLICKHOUSE_SECURE_NATIVE_USERNAME = os.Getenv("CLICKHOUSE_SECURE_NATIVE_USERNAME")

	dialCount := 0
	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{fmt.Sprintf("%s:%s", CLICKHOUSE_SECURE_NATIVE_HOSTNAME, CLICKHOUSE_SECURE_NATIVE_PORT)},
		Auth: clickhouse.Auth{
			Database: CLICKHOUSE_SECURE_NATIVE_DATABASE,
			Username: CLICKHOUSE_SECURE_NATIVE_USERNAME,
			Password: CLICKHOUSE_SECURE_NATIVE_PASSWORD,
		},
		DialContext: func(ctx context.Context, addr string) (net.Conn, error) {
			dialCount++
			var d net.Dialer
			return d.DialContext(ctx, "tcp", addr)
		},
		Debug: true,
		Debugf: func(format string, v ...any) {
			fmt.Printf(format, v...)
		},
		Settings: clickhouse.Settings{
			"max_execution_time": 60,
		},
		Compression: &clickhouse.Compression{
			Method: clickhouse.CompressionLZ4,
		},
		DialTimeout:      time.Second * 30,
		MaxOpenConns:     5,
		MaxIdleConns:     5,
		ConnMaxLifetime:  time.Minute * 10,
		ConnOpenStrategy: clickhouse.ConnOpenInOrder,
		ClientInfo: clickhouse.ClientInfo{
			Products: []struct {
				Name    string
				Version string
			}{
				{"k.d-app", "0.0.1"},
			},
		},
	})

	if err != nil {
		return nil, err
	}
	err = conn.Ping(context.Background())
	if err != nil {
		return nil, err
	}
	return conn, nil
}

func Middleware() fiber.Handler {
	return jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{Key: []byte(os.Getenv("JWT_SECRET"))},
		ContextKey: "jwt",
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   true,
				"message": "Unauthorized: " + err.Error(),
			})
		},
		SuccessHandler: func(c *fiber.Ctx) error {

			// user := c.Locals("jwt").(*jwt.Token)
			// claims := user.Claims.(jwt.MapClaims)

			return c.Next()
		},
	})
}

func VerifyToken(r *http.Request) (*types.TokenClaims, error) {

	keyset, err := jwk.Fetch(r.Context(), "http://localhost:3000/api/auth/jwks")
	if err != nil {
		return nil, err
	}

	token, err := jwt.ParseRequest(r, jwt.WithKeySet(keyset))
	if err != nil {
		return nil, err
	}

	jsBytes, err := json.MarshalIndent(token, "", " ")
	if err != nil {
		return nil, err
	}

	fmt.Println(string(jsBytes))

	return nil, nil
}
