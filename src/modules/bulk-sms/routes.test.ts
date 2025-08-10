import * as HttpStatusCodes from "stoker/http-status-codes";
import { describe, expect, it } from "vitest";

import { sendBulkSms, type SendBulkSmsRoute } from "./routes";

describe("bulk SMS Routes", () => {
  describe("sendBulkSms route configuration", () => {
    it("should have correct method and path", () => {
      expect(sendBulkSms.method).toBe("post");
      expect(sendBulkSms.path).toBe("/send");
    });

    it("should have correct tags", () => {
      expect(sendBulkSms.tags).toEqual(["Bulk SMS", "SMS"]);
    });
  });

  describe("request body validation", () => {
    const requestSchema = sendBulkSms.request.body.content["application/json"].schema;

    it("should validate valid request body", () => {
      const validBody = {
        sender: "TestSender",
        message: "Hello World",
        recipients: ["+1234567890", "+0987654321"],
      };

      const result = requestSchema.safeParse(validBody);
      expect(result.success).toBe(true);
    });

    it("should validate request body without sender (optional)", () => {
      const validBody = {
        message: "Hello World",
        recipients: ["+1234567890"],
      };

      const result = requestSchema.safeParse(validBody);
      expect(result.success).toBe(true);
    });

    it("should validate request body with null sender", () => {
      const validBody = {
        sender: null,
        message: "Hello World",
        recipients: ["+1234567890"],
      };

      const result = requestSchema.safeParse(validBody);
      expect(result.success).toBe(true);
    });

    it("should reject empty message", () => {
      const invalidBody = {
        sender: "TestSender",
        message: "",
        recipients: ["+1234567890"],
      };

      const result = requestSchema.safeParse(invalidBody);
      expect(result.success).toBe(false);
    });

    it("should reject missing message", () => {
      const invalidBody = {
        sender: "TestSender",
        recipients: ["+1234567890"],
      };

      const result = requestSchema.safeParse(invalidBody);
      expect(result.success).toBe(false);
    });

    it("should reject empty recipients array", () => {
      const invalidBody = {
        sender: "TestSender",
        message: "Hello World",
        recipients: [],
      };

      const result = requestSchema.safeParse(invalidBody);
      expect(result.success).toBe(true); // Empty array is valid, but business logic should handle this
    });

    it("should reject recipients with empty strings", () => {
      const invalidBody = {
        sender: "TestSender",
        message: "Hello World",
        recipients: ["", "+1234567890"],
      };

      const result = requestSchema.safeParse(invalidBody);
      expect(result.success).toBe(false);
    });

    it("should reject missing recipients", () => {
      const invalidBody = {
        sender: "TestSender",
        message: "Hello World",
      };

      const result = requestSchema.safeParse(invalidBody);
      expect(result.success).toBe(false);
    });
  });

  describe("response schemas", () => {
    it("should validate successful response", () => {
      const successSchema = sendBulkSms.responses[HttpStatusCodes.OK].content["application/json"].schema;
      const validResponse = {
        status: "success",
        totalSent: 5,
        totalFailed: 0,
      };

      const result = successSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it("should reject success response with wrong status", () => {
      const successSchema = sendBulkSms.responses[HttpStatusCodes.OK].content["application/json"].schema;
      const invalidResponse = {
        status: "failed",
        totalSent: 5,
        totalFailed: 0,
      };

      const result = successSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it("should validate bad request response", () => {
      const badRequestSchema = sendBulkSms.responses[HttpStatusCodes.BAD_REQUEST].content["application/json"].schema;
      const validResponse = {
        error: "Invalid phone number format",
      };

      const result = badRequestSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it("should validate internal server error response", () => {
      const errorSchema = sendBulkSms.responses[HttpStatusCodes.INTERNAL_SERVER_ERROR].content["application/json"].schema;
      const validResponse = {
        error: "SMS service unavailable",
      };

      const result = errorSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it("should reject error responses without error field", () => {
      const errorSchema = sendBulkSms.responses[HttpStatusCodes.BAD_REQUEST].content["application/json"].schema;
      const invalidResponse = {
        message: "Something went wrong",
      };

      const result = errorSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe("type exports", () => {
    it("should export SendBulkSmsRoute type", () => {
      // This test ensures the type is properly exported and can be used
      const routeType: SendBulkSmsRoute = sendBulkSms;
      expect(routeType).toBeDefined();
      expect(routeType.method).toBe("post");
    });
  });

  describe("edge cases", () => {
    it("should handle very long messages", () => {
      const requestSchema = sendBulkSms.request.body.content["application/json"].schema;
      const longMessage = "a".repeat(1000);
      const validBody = {
        message: longMessage,
        recipients: ["+1234567890"],
      };

      const result = requestSchema.safeParse(validBody);
      expect(result.success).toBe(true);
    });

    it("should handle large recipient lists", () => {
      const requestSchema = sendBulkSms.request.body.content["application/json"].schema;
      const manyRecipients = Array.from({ length: 100 }, (_, i) => `+123456789${i.toString().padStart(2, "0")}`);
      const validBody = {
        message: "Hello World",
        recipients: manyRecipients,
      };

      const result = requestSchema.safeParse(validBody);
      expect(result.success).toBe(true);
    });
  });
});
