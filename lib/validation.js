export function cleanString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function validateRequiredString(
  value,
  fieldName,
  maxLength = 500
) {
  const cleaned = cleanString(value);

  if (!cleaned) {
    return {
      valid: false,
      message: `${fieldName} is required.`,
      value: "",
    };
  }

  if (cleaned.length > maxLength) {
    return {
      valid: false,
      message: `${fieldName} must be less than ${maxLength} characters.`,
      value: cleaned,
    };
  }

  return {
    valid: true,
    message: "",
    value: cleaned,
  };
}

export function isValidEmail(email) {
  const value = cleanString(email);

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidObjectId(id) {
  return /^[a-f\d]{24}$/i.test(String(id));
}

export function validatePriority(priority) {
  return ["Low", "Medium", "High"].includes(priority);
}

export function safeDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}