package types

import (
	"github.com/golang-jwt/jwt/v5"
)

/*
UserId is simply a registered customer on the platform, so dont confuse with a userId of your website, NO!
WebsiteId is for a particular website you're tracking for

Those two fields are being handled by the AccountService running in nodejs, the Nodejs API does the account & user management

HookType is for a particular hook you wanna track (e.g useTrack, useTrackDuration) all of the hooks need an identifier
EventType is for any kind of random event (e.g cta_button_click, checkout_step_completed etc)

DefaultMetadata are the metadata that needs to be sent at certain intervals independent of user events
CoreMetadata are the data you're tracking

ElementMetadata are only useful for debugging & theyre html element specific data
*/
type Event struct {
	UserId    string `json:"user_id" validate:"required"`
	WebsiteId string `json:"website_id" validate:"required"`

	HookType  string `json:"hook_type" valdate:"required"`
	EventType string `json:"event_type" validate:"required"`

	DefaultMetadata map[string]any `json:"default_Mmetadata" validate:"required"`
	CoreMetadata    map[string]any `json:"core_metadata" validate:"required"`
	// useful for debugging
	ElementMetadata ElementMetadata `json:"element_metadata"`
	Timestamp       int64           `json:"timestamp"`
}

type ElementMetadata struct {
	ElementRef      string `json:"element_ref"`
	ElementId       string `json:"element_id"`
	ElementSelector string `json:"element_selector"`
	ElementPath     string `json:"element_path"`
}

type TokenClaims struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	UserType string `json:"userType"`
	jwt.RegisteredClaims
}

type HookType int

const (
	TRACK_EVENT HookType = iota + 1
	TRACK_ELEMENT_EVENT
	TRACK_DURATION
	TRACK_CLICKS
	TRACK_VISIBILITY
)

func (ts HookType) String() string {
	return [...]string{"track_event", "track_element_event", "track_duration", "track_clicks", "track_visibility"}[ts-1]
}

type LoginSchema struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type SignupSchema struct {
	Email          string `json:"email" validate:"required,email"`
	Password       string `json:"password" validate:"required"`
	GoogleClientID string `json:"google_client_id" validate:"required"`
	FullName       string `json:"full_name" validate:"required,min=5"`
}

type AddWebsiteSchema struct {
	Domain string `json:"domain" validate:"required"`
	Hosts  string `json:"hosts" validate:"required"`
	Name   string `json:"name" validate:"required"`
}
