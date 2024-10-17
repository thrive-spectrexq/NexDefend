package db

import (
    "database/sql"
    "fmt"
    _ "github.com/lib/pq"
)

var db *sql.DB

func InitDB() {
    var err error
    connStr := "user=nexdefend password=password dbname=nexdefend_db sslmode=disable"
    db, err = sql.Open("postgres", connStr)
    if err != nil {
        fmt.Println("Failed to connect to the database:", err)
        return
    }
    err = db.Ping()
    if err != nil {
        fmt.Println("Database connection failed:", err)
        return
    }
    fmt.Println("Database connection successful!")
}
