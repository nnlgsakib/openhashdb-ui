package openhashdb

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
)

//go:embed build/*
var embeddedFiles embed.FS

// GetHandler returns an http.Handler to serve the embedded frontend build
func GetHandler() http.Handler {
	subFS, err := fs.Sub(embeddedFiles, "build")
	if err != nil {
		log.Fatalf("Failed to load embedded frontend: %v", err)
	}
	return http.FileServer(http.FS(subFS))
}
