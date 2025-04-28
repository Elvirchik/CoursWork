package Proj.laba.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;

@Schema(description = "DTO пользователя")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class UserDTO extends GenericDTO {

    @Size(min = 6, max = 100, message = "Пароль должен содержать от 6 до 100 символов")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$",
            message = "Пароль должен содержать как минимум одну букву и одну цифру")
    @Schema(description = "Пароль пользователя")
    private String password;

    @NotBlank(message = "Email не может быть пустым")
    @Email(message = "Некорректный формат email")
    @Schema(description = "Email пользователя", example = "user@example.com")
    private String email;

    @Past(message = "Дата рождения должна быть в прошлом")
    @Schema(description = "Дата рождения", example = "1990-01-01")
    private LocalDate birthDate;

    @NotBlank(message = "Имя не может быть пустым")
    @Size(min = 2, max = 50, message = "Имя должно содержать от 2 до 50 символов")
    @Schema(description = "Имя пользователя", example = "Иван")
    private String firstName;

    @NotBlank(message = "Фамилия не может быть пустой")
    @Size(min = 2, max = 50, message = "Фамилия должна содержать от 2 до 50 символов")
    @Schema(description = "Фамилия пользователя", example = "Иванов")
    private String lastName;

    @Pattern(regexp = "^\\+7\\d{10}$", message = "Телефон должен быть в формате +7XXXXXXXXXX")
    @Schema(description = "Номер телефона", example = "+79001234567")
    private String phone;


    @Schema(description = "Роль пользователя")
    private RoleDTO role;
}
