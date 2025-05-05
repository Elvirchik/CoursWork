package Proj.laba.controller.rest;

import Proj.laba.dto.*;
import Proj.laba.service.UserService;
import Proj.laba.service.JWTService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/auth")
@Tag(name = "Авторизация", description = "Контроллер для авторизации и регистрации пользователей")
public class AuthController {
    private final UserService userService;
    private final JWTService jwtService;

    public AuthController(UserService userService, JWTService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @Operation(description = "Регистрация нового пользователя")
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDTO request) {
        try {
            UserDTO newUser = userService.register(request);
            return ResponseEntity.ok(RegisterResponseDTO.builder()
                    .success(true)
                    .message("Пользователь успешно зарегистрирован")
                    .build());
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(RegisterResponseDTO.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    @Operation(description = "Авторизация пользователя")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO request, HttpServletResponse response) {
        try {
            UserDTO authenticatedUser = userService.authenticate(request.getEmail(), request.getPassword());
            String token = jwtService.generateToken(authenticatedUser);

            // Устанавливаем JWT в cookie
            jwtService.setTokenInCookie(token, response, Duration.of(30, ChronoUnit.MINUTES));

            return ResponseEntity.ok(AuthResponseDTO.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .build());
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(RegisterResponseDTO.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }
}
