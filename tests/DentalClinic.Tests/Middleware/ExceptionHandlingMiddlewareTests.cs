using System.Net;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using DentalClinic.Api.Middleware;

namespace DentalClinic.Tests.Middleware;

public class ExceptionHandlingMiddlewareTests
{
    private readonly Mock<ILogger<ExceptionHandlingMiddleware>> _mockLogger;

    public ExceptionHandlingMiddlewareTests()
    {
        _mockLogger = new Mock<ILogger<ExceptionHandlingMiddleware>>();
    }

    private static DefaultHttpContext CreateHttpContext()
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        return context;
    }

    private async Task<(int StatusCode, string Body)> InvokeMiddleware(Exception exception)
    {
        var context = CreateHttpContext();
        var middleware = new ExceptionHandlingMiddleware(
            next: _ => throw exception,
            logger: _mockLogger.Object);

        await middleware.InvokeAsync(context);

        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var body = await new StreamReader(context.Response.Body).ReadToEndAsync();
        return (context.Response.StatusCode, body);
    }

    [Fact]
    public async Task InvokeAsync_NoException_CallsNext()
    {
        // Arrange
        var context = CreateHttpContext();
        var nextCalled = false;
        var middleware = new ExceptionHandlingMiddleware(
            next: _ => { nextCalled = true; return Task.CompletedTask; },
            logger: _mockLogger.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        nextCalled.Should().BeTrue();
    }

    [Fact]
    public async Task InvokeAsync_KeyNotFoundException_Returns404()
    {
        // Act
        var (statusCode, body) = await InvokeMiddleware(new KeyNotFoundException("Patient not found"));

        // Assert
        statusCode.Should().Be((int)HttpStatusCode.NotFound);
        body.Should().Contain("Patient not found");
    }

    [Fact]
    public async Task InvokeAsync_ArgumentException_Returns400()
    {
        // Act
        var (statusCode, body) = await InvokeMiddleware(new ArgumentException("Invalid input"));

        // Assert
        statusCode.Should().Be((int)HttpStatusCode.BadRequest);
        body.Should().Contain("Invalid input");
    }

    [Fact]
    public async Task InvokeAsync_InvalidOperationException_Returns409()
    {
        // Act
        var (statusCode, body) = await InvokeMiddleware(new InvalidOperationException("Conflict detected"));

        // Assert
        statusCode.Should().Be((int)HttpStatusCode.Conflict);
        body.Should().Contain("Conflict detected");
    }

    [Fact]
    public async Task InvokeAsync_GenericException_Returns500()
    {
        // Act
        var (statusCode, body) = await InvokeMiddleware(new Exception("Something broke"));

        // Assert
        statusCode.Should().Be((int)HttpStatusCode.InternalServerError);
        body.Should().Contain("An unexpected error occurred");
        body.Should().NotContain("Something broke"); // should not leak internal details
    }

    [Fact]
    public async Task InvokeAsync_ReturnsJsonContentType()
    {
        // Arrange
        var context = CreateHttpContext();
        var middleware = new ExceptionHandlingMiddleware(
            next: _ => throw new KeyNotFoundException("test"),
            logger: _mockLogger.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.ContentType.Should().Be("application/json");
    }

    [Fact]
    public async Task InvokeAsync_ReturnsValidJson()
    {
        // Act
        var (_, body) = await InvokeMiddleware(new KeyNotFoundException("Not found"));

        // Assert
        var json = JsonSerializer.Deserialize<JsonElement>(body);
        json.GetProperty("error").GetString().Should().Be("Not found");
    }

    [Fact]
    public async Task InvokeAsync_UsesCamelCasePropertyNaming()
    {
        // Act
        var (_, body) = await InvokeMiddleware(new KeyNotFoundException("test"));

        // Assert
        body.Should().Contain("\"error\"");
        body.Should().NotContain("\"Error\"");
    }
}
