package Proj.laba.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String to, String token, String resetUrl) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("test_elvir@mail.ru");
        helper.setTo(to);
        helper.setSubject("Восстановление пароля");

        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;'>"
                + "<h2 style='color: #333;'>Восстановление пароля</h2>"
                + "<p>Вы запросили восстановление пароля. Для продолжения нажмите на кнопку ниже:</p>"
                + "<div style='text-align: center; margin: 25px 0;'>"
                + "<a href='" + resetUrl + "?token=" + token + "' style='background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;'>Сбросить пароль</a>"
                + "</div>"
                + "<p>Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.</p>"
                + "<p style='font-size: 12px; color: #777; margin-top: 30px;'>Это автоматическое сообщение. Пожалуйста, не отвечайте на него.</p>"
                + "</div>";

        helper.setText(htmlContent, true);

        mailSender.send(message);
    }
}
