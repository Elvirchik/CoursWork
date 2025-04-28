package Proj.laba.controller.rest;

import Proj.laba.dto.ServiceOrderDTO;
import Proj.laba.mapper.ServiceOrderMapper;
import Proj.laba.model.ServiceOrder;
import Proj.laba.service.ServiceOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/service-orders")
@Tag(name = "Заказы услуг", description = "Контроллер для работы с заказами услуг")
public class ServiceOrderController extends GenericController<ServiceOrder, ServiceOrderDTO> {

    private final ServiceOrderService serviceOrderService;

    public ServiceOrderController(ServiceOrderService serviceOrderService, ServiceOrderMapper serviceOrderMapper) {
        super(serviceOrderService, serviceOrderMapper);
        this.serviceOrderService = serviceOrderService;
    }

    @Operation(description = "Получить все заказы услуг пользователя")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ServiceOrderDTO>> getAllUserOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(serviceOrderService.getAllUserOrders(userId));
    }

    @Operation(description = "Создать заказ услуги для пользователя")
    @PostMapping("/user/{userId}/service/{serviceId}")
    public ResponseEntity<ServiceOrderDTO> createOrderForUser(
            @PathVariable Long userId,
            @PathVariable Long serviceId,
            @RequestBody ServiceOrderDTO orderDTO) {
        orderDTO.setUserId(userId);
        orderDTO.setServiceId(serviceId);
        return ResponseEntity.ok(serviceOrderService.create(orderDTO));
    }

    @Operation(description = "Удалить заказ услуги у пользователя")
    @DeleteMapping("/user/{userId}/order/{orderId}")
    public ResponseEntity<Void> deleteUserOrder(
            @PathVariable Long userId,
            @PathVariable Long orderId) {
        serviceOrderService.delete(orderId);
        return ResponseEntity.ok().build();
    }
}
