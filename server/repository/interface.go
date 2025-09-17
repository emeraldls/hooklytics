package repository

import (
	"github.com/emeraldls/hooklytics/schema/query"
	"github.com/emeraldls/hooklytics/types"
)

type RepositoryInterface interface {
	SignIn(_ types.LoginSchema) (query.User, error)
	SignUp(_ types.SignupSchema) (query.User, error)
}
