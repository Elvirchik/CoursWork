// File path: [back\src\main\java\Proj\laba\controller\rest\PasswordResetController.java](file:///C:\Users\elfir\OneDrive\Рабочий стол\CoursWork-main\back\src\main\java\Proj\laba\controller\rest\PasswordResetController.java)
package Proj.laba.controller.rest;

import Proj.laba.dto.NewPasswordDTO;
import Proj.laba.dto.PasswordResetRequestDTO;
import Proj.laba.exception.InvalidTokenException;
import org.webjars.NotFoundException;
import Proj.laba.exception.PasswordMismatchException;
import Proj.laba.service.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/password-reset")
@Tag(name = "Восстановление пароля", description = "API для восстановления пароля")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @Operation(description = "Запросить восстановление пароля")
    @PostMapping("/request")
    public ResponseEntity<?> requestPasswordReset(@Valid @RequestBody PasswordResetRequestDTO requestDTO) {
        try {
            passwordResetService.requestPasswordReset(requestDTO);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Инструкции по восстановлению пароля отправлены на указанный email");
            return ResponseEntity.ok(response);
        } catch (NotFoundException e) {
            // Для безопасности мы всё равно возвращаем успешный ответ, но с сообщением об ошибке
            Map<String, String> response = new HashMap<>();
            response.put("message", "Пользователь с таким email не найден");
            return ResponseEntity.ok(response); // Возвращаем OK, но с сообщением об ошибке
        } catch (MessagingException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Ошибка при отправке email");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @Operation(description = "Проверить валидность токена")
    @GetMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        try {
            boolean isValid = passwordResetService.validateToken(token);
            Map<String, Boolean> response = new HashMap<>();
            response.put("valid", isValid);
            return ResponseEntity.ok(response);
        } catch (InvalidTokenException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @Operation(description = "Сбросить пароль")
    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody NewPasswordDTO newPasswordDTO) {
        try {
            passwordResetService.resetPassword(newPasswordDTO);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Пароль успешно изменен");
            return ResponseEntity.ok(response);
        } catch (InvalidTokenException | PasswordMismatchException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
