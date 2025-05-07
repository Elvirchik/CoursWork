// File path: [back\src\main\java\Proj\laba\service\PasswordResetService.java](file:///C:\Users\elfir\OneDrive\Рабочий стол\CoursWork-main\back\src\main\java\Proj\laba\service\PasswordResetService.java)
package Proj.laba.service;

import Proj.laba.dto.NewPasswordDTO;
import Proj.laba.dto.PasswordResetRequestDTO;
import Proj.laba.exception.InvalidTokenException;
import org.webjars.NotFoundException;
import Proj.laba.exception.PasswordMismatchException;
import Proj.laba.model.PasswordResetToken;
import Proj.laba.model.User;
import Proj.laba.reposirory.PasswordResetTokenRepository;
import Proj.laba.reposirory.UserRepository;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordService passwordService;

    @Value("${app.password-reset.token.expiration-minutes:30}")
    private int tokenExpirationMinutes;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                EmailService emailService,
                                PasswordService passwordService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordService = passwordService;
    }

    @Transactional
    public void requestPasswordReset(PasswordResetRequestDTO requestDTO) throws MessagingException {
        String email = requestDTO.getEmail();
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new NotFoundException("Пользователь с таким email не найден");
        }

        User user = userOptional.get();

        // Создаем уникальный токен
        String token = UUID.randomUUID().toString();

        // Проверяем, есть ли уже токен для этого пользователя
        Optional<PasswordResetToken> existingToken = tokenRepository.findByUserEmail(email);

        PasswordResetToken resetToken;
        if (existingToken.isPresent()) {
            resetToken = existingToken.get();
            resetToken.setToken(token);
            resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(tokenExpirationMinutes));
            resetToken.setUsed(false);
        } else {
            resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setToken(token);
            resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(tokenExpirationMinutes));
        }

        tokenRepository.save(resetToken);

        // Отправляем email с ссылкой на сброс пароля
        String resetUrl = frontendUrl + "/reset-password";
        emailService.sendPasswordResetEmail(email, token, resetUrl);
    }

    @Transactional
    public void resetPassword(NewPasswordDTO newPasswordDTO) {
        if (!newPasswordDTO.getPassword().equals(newPasswordDTO.getConfirmPassword())) {
            throw new PasswordMismatchException("Пароли не совпадают");
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(newPasswordDTO.getToken())
                .orElseThrow(() -> new InvalidTokenException("Недействительный токен"));

        if (resetToken.isExpired()) {
            throw new InvalidTokenException("Токен истек");
        }

        if (resetToken.isUsed()) {
            throw new InvalidTokenException("Токен уже использован");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordService.encodePassword(newPasswordDTO.getPassword()));
        userRepository.save(user);

        // Помечаем токен как использованный
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }

    public boolean validateToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Недействительный токен"));

        if (resetToken.isExpired()) {
            throw new InvalidTokenException("Токен истек");
        }

        if (resetToken.isUsed()) {
            throw new InvalidTokenException("Токен уже использован");
        }

        return true;
    }
}
