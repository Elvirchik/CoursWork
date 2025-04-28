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

    @NotNull(message = "Пользователь должен быть указан")
    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Услуга должна быть указана")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Services service;

    @Column(name = "price")
    private BigDecimal price;

    @Column(name = "comment") // Добавляем поле для комментария
    private String comment;
}
