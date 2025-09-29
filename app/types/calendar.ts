export interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  reminders?: {
    useDefault: boolean;
    overrides: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

export interface CreateEventRequest {
  summary: string;
  description?: string;
  start: string;
  end: string;
}

export interface CreateEventResponse {
  success: boolean;
  eventId?: string;
  eventLink?: string;
  hangoutLink?: string;
  error?: string;
  details?: string;
}
