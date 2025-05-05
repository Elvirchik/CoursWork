package Proj.laba.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO для заказа услуг")
public class ServiceOrderDTO extends GenericDTO {

    @NotNull(message = "ID пользователя должен быть указан")
    private Long userId;

    @NotNull(message = "ID услуги должен быть указан")
    private Long serviceId;

    private BigDecimal price;

    private String comment;

    // Поля для информации об услуге и пользователе
    private String serviceName;
    private String userFirstName;
    private String userLastName;
}
