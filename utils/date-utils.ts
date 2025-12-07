export const formatPersianDate = (dateString: string | undefined): string => {
  if (!dateString) return ""

  try {
    // Handle different date formats that might come from WordPress
    let date: Date

    // Check if it's already a valid date string
    if (dateString.includes("T") || dateString.includes("-")) {
      date = new Date(dateString)
    } else {
      // Try parsing as timestamp if it's a number string
      const timestamp = parseInt(dateString)
      if (!isNaN(timestamp)) {
        date = new Date(timestamp * 1000) // Convert from Unix timestamp
      } else {
        date = new Date(dateString)
      }
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "تاریخ نامعتبر"
    }

    // Format to Persian date
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  } catch (error) {
    return "تاریخ نامعتبر"
  }
}
