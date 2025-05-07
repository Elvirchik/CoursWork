package Proj.laba.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "service_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOrder extends GenericModel {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Services service;

    @NotNull(message = "Дата заказа не может быть пустой")
    @Column(name = "order_date", nullable = false)
    private java.time.LocalDate orderDate;

    @Size(max = 500, message = "Комментарий не может быть длиннее 500 символов")
    @Column(name = "comment")
    private String comment;

    @NotNull(message = "Цена не может быть пустой")
    @DecimalMin(value = "0.0", inclusive = false, message = "Цена должна быть больше нуля")
    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @NotNull(message = "Статус заказа не может быть пустым")
    @Column(name = "status", nullable = false)
    private String status = "Ожидает обработки"; // Добавлено новое поле для статуса заказа с значением по умолчанию
}
