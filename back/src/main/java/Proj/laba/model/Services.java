package Proj.laba.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "services")
public class Services extends GenericModel {

    @NotBlank(message = "Название услуги не может быть пустым")
    @Size(min = 2, max = 100, message = "Название услуги должно содержать от 2 до 100 символов")
    @Column(name = "name", nullable = false)
    private String serviceName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted")
    private Boolean deleted = false;
}
