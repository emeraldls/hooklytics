package main

func getString(val any) string {
	if s, ok := val.(string); ok {
		return s
	}
	return ""
}

func getInt(val any) int {
	switch v := val.(type) {
	case float64:
		return int(v)
	case int:
		return v
	}
	return 0
}

func getUUID(val any) string {
	if s, ok := val.(string); ok {
		return s
	}
	return "00000000-0000-0000-0000-000000000000"
}
