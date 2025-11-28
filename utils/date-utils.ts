export const formatPersianDate = (dateString: string | undefined): string => {
  if (!dateString) return "";

  try {
    // Handle different date formats that might come from WordPress
    let date: Date;

    // Check if it's already a valid date string
    if (dateString.includes("T") || dateString.includes("-")) {
      date = new Date(dateString);
    } else {
      // Try parsing as timestamp if it's a number string
      const timestamp = parseInt(dateString);
      if (!isNaN(timestamp)) {
        date = new Date(timestamp * 1000); // Convert from Unix timestamp
      } else {
        date = new Date(dateString);
      }
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "تاریخ نامعتبر";
    }

    // Format to Persian date
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.warn("Date formatting error:", error);
    return "تاریخ نامعتبر";
  }
};

export const formatEnglishDate = (dateString: string | undefined): string => {
  if (!dateString) return "";

  try {
    let date: Date;

    if (dateString.includes("T") || dateString.includes("-")) {
      date = new Date(dateString);
    } else {
      const timestamp = parseInt(dateString);
      if (!isNaN(timestamp)) {
        date = new Date(timestamp * 1000);
      } else {
        date = new Date(dateString);
      }
    }

    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.warn("Date formatting error:", error);
    return "Invalid Date";
  }
};

export const isValidDate = (dateString: string | undefined): boolean => {
  if (!dateString) return false;

  try {
    let date: Date;

    if (dateString.includes("T") || dateString.includes("-")) {
      date = new Date(dateString);
    } else {
      const timestamp = parseInt(dateString);
      if (!isNaN(timestamp)) {
        date = new Date(timestamp * 1000);
      } else {
        date = new Date(dateString);
      }
    }

    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
};
