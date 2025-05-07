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

    @NotNull(message = "ID пользователя не может быть пустым")
    @Schema(description = "ID пользователя")
    private Long userId;

    @NotNull(message = "ID услуги не может быть пустым")
    @Schema(description = "ID услуги")
    private Long serviceId;

    @Schema(description = "Имя пользователя")
    private String userName;

    @Schema(description = "Название услуги")
    private String serviceName;

    @NotNull(message = "Дата заказа не может быть пустой")
    @Schema(description = "Дата заказа")
    private java.time.LocalDate orderDate;

    @Size(max = 500, message = "Комментарий не может быть длиннее 500 символов")
    @Schema(description = "Комментарий к заказу")
    private String comment;

    @NotNull(message = "Цена не может быть пустой")
    @DecimalMin(value = "0.0", inclusive = false, message = "Цена должна быть больше нуля")
    @Schema(description = "Цена услуги")
    private BigDecimal price;

    @Schema(description = "Статус заказа")
    private String status;

    private String userFirstName;
    private String userLastName;
}
