// Copyright The MatrixHub Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package registry

import (
	"context"
	"time"
)

type Registry struct {
	ID             int `gorm:"primarykey"`
	Name           string
	Description    string
	Type           string
	URL            string
	CredentialType string
	AuthInfo       string
	Insecure       bool
	Status         int
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

func (Registry) TableName() string {
	return "registries"
}

type IRegistryRepo interface {
	ListRegistries(ctx context.Context, page, pageSize int, search string) ([]*Registry, int64, error)
	GetRegistry(ctx context.Context, id int32) (*Registry, error)
	CreateRegistry(ctx context.Context, registry Registry) (*Registry, error)
	UpdateRegistry(ctx context.Context, registry Registry) error
	DeleteRegistry(ctx context.Context, id int32) error
}
