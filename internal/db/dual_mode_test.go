package db

import (
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestInitDB_SQLite_DemoMode(t *testing.T) {
	// Setup temp dir for sqlite db
	tmpDir := t.TempDir()
	dbPath := filepath.Join(tmpDir, "test.db")
	t.Setenv("DB_PATH", dbPath)
	t.Setenv("DB_TYPE", "") // Default to SQLite

	// Reset dbInstance to allow re-initialization (hacky, but needed since it's a singleton)
	dbInstance = nil

	db := InitDB()
	assert.NotNil(t, db)

	// Verify we are connected to sqlite
	assert.Equal(t, "sqlite", db.Dialector.Name())

	// Verify tables are migrated (check one)
	hasUser := db.Migrator().HasTable("users")
	assert.True(t, hasUser, "users table should exist")
}

func TestInitDB_Postgres_EnterpriseMode_Config(t *testing.T) {
	// We can't easily test actual connection without a running Postgres,
	// but we can test that it TRIES to use Postgres if DB_TYPE is set.
	// However, InitDB connects immediately and log.Fatal on failure.
	// So we can't unit test the failure easily without crashing the test runner.
	// We will skip this test if no postgres is available, but the SQLite test confirms
	// the default path works.
	t.Skip("Skipping Postgres test as it requires a running instance")
}
