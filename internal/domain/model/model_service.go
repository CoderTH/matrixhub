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

package model

import (
	"context"
	"errors"
	"strings"

	"github.com/matrixhub-ai/matrixhub/internal/domain/git"
)

// IModelService defines the service interface for model operations.
type IModelService interface {
	// Model CRUD operations
	CreateModel(ctx context.Context, project, name string) (*Model, error)
	GetModel(ctx context.Context, project, name string) (*Model, error)
	ListModels(ctx context.Context, filter *Filter) ([]*Model, int64, error)
	DeleteModel(ctx context.Context, project, name string) error

	// Label operations
	ListModelTaskLabels(ctx context.Context) ([]*Label, error)
	ListModelFrameLabels(ctx context.Context) ([]*Label, error)

	// Git operations
	ListModelRevisions(ctx context.Context, project, name string) (*git.Revisions, error)
	ListModelCommits(ctx context.Context, project, name, revision string, page, pageSize int) ([]*git.Commit, int64, error)
	GetModelCommit(ctx context.Context, project, name, commitID string) (*git.Commit, error)
	GetModelTree(ctx context.Context, project, name, revision, path string) ([]*git.TreeEntry, error)
	GetModelBlob(ctx context.Context, project, name, revision, path string) (*git.TreeEntry, error)
}

// ModelService implements the model service operations.
type ModelService struct {
	modelRepo IModelRepo
	labelRepo ILabelRepo
	gitRepo   git.IGitRepo
}

// NewModelService creates a new ModelService instance.
func NewModelService(modelRepo IModelRepo, labelRepo ILabelRepo, gitRepo git.IGitRepo) IModelService {
	return &ModelService{
		modelRepo: modelRepo,
		labelRepo: labelRepo,
		gitRepo:   gitRepo,
	}
}

// CreateModel creates a new model in the system.
func (s *ModelService) CreateModel(ctx context.Context, project, name string) (*Model, error) {
	if project == "" {
		return nil, errors.New("invalid project")
	}
	if name == "" {
		return nil, errors.New("invalid name")
	}

	// Check if model already exists
	_, err := s.modelRepo.GetByProjectAndName(ctx, project, name)
	if err == nil {
		return nil, errors.New("model already exists")
	}
	// If error message contains "not found", continue to create
	// Otherwise, return the error
	if !strings.Contains(err.Error(), "not found") {
		return nil, err
	}

	model := &Model{
		Name:        name,
		ProjectName: project,
	}

	if err := s.gitRepo.CreateRepository(ctx, project, name); err != nil {
		return nil, err
	}

	return s.modelRepo.Create(ctx, model)
}

// GetModel retrieves a model by project and name.
func (s *ModelService) GetModel(ctx context.Context, project, name string) (*Model, error) {
	if project == "" {
		return nil, errors.New("invalid project")
	}
	if name == "" {
		return nil, errors.New("invalid input")
	}

	mod, err := s.modelRepo.GetByProjectAndName(ctx, project, name)
	if err != nil {
		return nil, err
	}

	return mod, nil
}

// ListModels returns a paginated list of models with optional filtering.
func (s *ModelService) ListModels(ctx context.Context, filter *Filter) ([]*Model, int64, error) {
	if filter == nil {
		filter = &Filter{
			Page:     1,
			PageSize: 20,
		}
	}

	return s.modelRepo.List(ctx, filter)
}

// DeleteModel deletes a model by project and name.
func (s *ModelService) DeleteModel(ctx context.Context, project, name string) error {
	if project == "" {
		return errors.New("invalid project")
	}
	if name == "" {
		return errors.New("invalid input")
	}

	// First delete the Git repository, then delete the model record in the database.
	if err := s.gitRepo.DeleteRepository(ctx, project, name); err != nil {
		return err
	}

	return s.modelRepo.Delete(ctx, project, name)
}

// ListModelTaskLabels returns all task labels for models.
func (s *ModelService) ListModelTaskLabels(ctx context.Context) ([]*Label, error) {
	return s.labelRepo.ListByCategoryAndScope(ctx, "task", "model")
}

// ListModelFrameLabels returns all framework labels for models.
func (s *ModelService) ListModelFrameLabels(ctx context.Context) ([]*Label, error) {
	return s.labelRepo.ListByCategoryAndScope(ctx, "library", "model")
}

// ListModelRevisions returns all branches and tags for a model.
func (s *ModelService) ListModelRevisions(ctx context.Context, project, name string) (*git.Revisions, error) {
	if project == "" {
		return nil, errors.New("invalid project")
	}
	if name == "" {
		return nil, errors.New("invalid input")
	}

	return s.gitRepo.ListRevisions(ctx, project, name)
}

// ListModelCommits returns the commit history for a model.
func (s *ModelService) ListModelCommits(ctx context.Context, project, name, revision string, page, pageSize int) ([]*git.Commit, int64, error) {
	if project == "" {
		return nil, 0, errors.New("invalid project")
	}
	if name == "" {
		return nil, 0, errors.New("invalid input")
	}

	// Set default values
	if page <= 0 {
		page = 1

	}
	if pageSize <= 0 {
		pageSize = 20
	}

	return s.gitRepo.ListCommits(ctx, project, name, revision, page, pageSize)
}

// GetModelCommit returns a specific commit by ID.
func (s *ModelService) GetModelCommit(ctx context.Context, project, name, commitID string) (*git.Commit, error) {
	if project == "" {
		return nil, errors.New("invalid project")
	}
	if name == "" {
		return nil, errors.New("invalid input")
	}
	if commitID == "" {
		return nil, errors.New("invalid input")
	}

	return s.gitRepo.GetCommit(ctx, project, name, commitID)
}

// GetModelTree returns the file tree at a specific revision and path.
func (s *ModelService) GetModelTree(ctx context.Context, project, name, revision, path string) ([]*git.TreeEntry, error) {
	if project == "" {
		return nil, errors.New("invalid project")
	}
	if name == "" {
		return nil, errors.New("invalid input")
	}

	return s.gitRepo.GetTree(ctx, project, name, revision, path)
}

// GetModelBlob returns the content of a file at a specific revision.
func (s *ModelService) GetModelBlob(ctx context.Context, project, name, revision, path string) (*git.TreeEntry, error) {
	if project == "" {
		return nil, errors.New("invalid project")
	}
	if name == "" {
		return nil, errors.New("invalid input")
	}

	return s.gitRepo.GetBlob(ctx, project, name, revision, path)
}
