package compliance

import (
	"fmt"
	"net/http"
	"time"

	"github.com/jung-kurt/gofpdf" // Ensure you add this to go.mod
	"github.com/thrive-spectrexq/NexDefend/internal/db"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

// GenerateComplianceReport creates a PDF report of current system status
func GenerateComplianceReport(w http.ResponseWriter, r *http.Request) {
	// 1. Fetch Data
	// In a real scenario, the DB instance should be injected via a struct/interface
	// For now, we assume db.InitDB() was called and returns the singleton
	database := db.InitDB().GetDB()

	var incidents []models.Incident
	database.Where("status = ?", "Open").Find(&incidents)

	var vulns []models.Vulnerability
	database.Where("severity = ?", "Critical").Find(&vulns)

	// 2. Initialize PDF
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)

	// Header
	pdf.Cell(40, 10, "NexDefend Security Report")
	pdf.Ln(12)

	pdf.SetFont("Arial", "", 10)
	pdf.Cell(0, 10, fmt.Sprintf("Generated on: %s", time.Now().Format(time.RFC1123)))
	pdf.Ln(20)

	// Section: Executive Summary
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(0, 10, "1. Executive Summary")
	pdf.Ln(10)
	pdf.SetFont("Arial", "", 12)
	summary := fmt.Sprintf("System analysis detected %d open incidents and %d critical vulnerabilities. Immediate attention is required for critical items.", len(incidents), len(vulns))
	pdf.MultiCell(0, 6, summary, "", "", false)
	pdf.Ln(10)

	// Section: Critical Incidents
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(0, 10, "2. Open Incidents")
	pdf.Ln(10)

	pdf.SetFont("Arial", "B", 10)
	pdf.Cell(20, 10, "ID")
	pdf.Cell(40, 10, "Severity")
	pdf.Cell(100, 10, "Description")
	pdf.Ln(10)

	pdf.SetFont("Arial", "", 10)
	for _, inc := range incidents {
		pdf.Cell(20, 10, fmt.Sprintf("%d", inc.ID))
		pdf.Cell(40, 10, inc.Severity)
		// Truncate description to fit
		desc := inc.Description
		if len(desc) > 50 { desc = desc[:47] + "..." }
		pdf.Cell(100, 10, desc)
		pdf.Ln(8)
	}
	pdf.Ln(10)

	// Section: Critical Vulnerabilities
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(0, 10, "3. Critical Vulnerabilities")
	pdf.Ln(10)

	pdf.SetFont("Arial", "", 10)
	for _, v := range vulns {
		pdf.Cell(0, 8, fmt.Sprintf("- [%s] %s (%s)", v.Severity, v.PackageName, v.Title))
		pdf.Ln(6)
	}

	// 3. Output
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", "attachment; filename=nexdefend_report.pdf")
	err := pdf.Output(w)
	if err != nil {
		http.Error(w, "Failed to generate PDF", http.StatusInternalServerError)
    }
}
