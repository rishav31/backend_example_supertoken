<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# SuperTokens Spring Boot Project Instructions

This is a Spring Boot application integrated with SuperTokens for authentication. When working with this codebase:

## Technologies Used
- Java 17
- Spring Boot 3.2.0
- Spring Security
- SuperTokens Java SDK
- Maven for dependency management

## Key Components
- `SuperTokensConfig.java`: Initializes SuperTokens SDK
- `WebConfig.java`: Configures CORS and Spring Security
- `AuthController.java`: Handles authentication endpoints (signup, signin, signout)
- `ApiController.java`: Contains protected and public API endpoints
- `config.yaml`: SuperTokens core configuration

## Development Guidelines
- Use proper exception handling for SuperTokens operations
- Follow REST API conventions for endpoint naming
- Include proper CORS configuration for frontend integration
- Use Spring Security annotations for endpoint protection
- Handle session validation in protected endpoints
- Follow Spring Boot best practices for configuration management

## Authentication Flow
1. Users sign up/sign in through `/api/auth/signup` and `/api/auth/signin`
2. SuperTokens handles session management automatically
3. Protected endpoints require valid session tokens in Authorization header
4. Session validation is done using SuperTokens Session.getSession() method

## Testing
- Use proper HTTP status codes (200, 400, 401, 500)
- Include comprehensive error handling
- Test both authenticated and unauthenticated scenarios
