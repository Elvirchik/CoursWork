package Proj.laba.controller.rest;

import Proj.laba.dto.ServiceOrderDTO;
import Proj.laba.mapper.ServiceOrderMapper;
import Proj.laba.model.ServiceOrder;
import Proj.laba.service.ServiceOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/service-orders")
@Tag(name = "Заказы услуг", description = "Контроллер для работы с заказами услуг")
public class ServiceOrderController extends GenericController<ServiceOrder, ServiceOrderDTO> {

    private final ServiceOrderService serviceOrderService;
    private final ServiceOrderMapper serviceOrderMapper;

    public ServiceOrderController(ServiceOrderService serviceOrderService, ServiceOrderMapper serviceOrderMapper) {
        super(serviceOrderService, serviceOrderMapper);
        this.serviceOrderService = serviceOrderService;
        this.serviceOrderMapper = serviceOrderMapper;
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

    // Новый метод - получить все заявки (для администратора)
    @Operation(description = "Получить все заявки на услуги")
    @GetMapping("/all")
    public ResponseEntity<List<ServiceOrderDTO>> getAllOrders() {
        return ResponseEntity.ok(serviceOrderService.getAllOrders());
    }

    // Новый метод - обновить цену и комментарий в заявке
    @Operation(description = "Обновить цену и комментарий в заявке")
    @PutMapping("/{orderId}")
    public ResponseEntity<ServiceOrderDTO> updateOrder(
            @PathVariable Long orderId,
            @RequestBody ServiceOrderDTO orderDTO) {
        orderDTO.setId(orderId);
        return ResponseEntity.ok(serviceOrderService.updateOrderDetails(orderDTO));
    }

    // Мягкое удаление заявки
    @Operation(description = "Мягкое удаление заявки на услугу")
    @DeleteMapping("/soft/{id}")
    public ResponseEntity<Void> softDeleteOrder(@PathVariable Long id) {
        serviceOrderService.softDelete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    // Оставляем метод жесткого удаления для совместимости
    @Operation(description = "Удалить заказ услуги у пользователя")
    @DeleteMapping("/user/{userId}/order/{orderId}")
    public ResponseEntity<Void> deleteUserOrder(
            @PathVariable Long userId,
            @PathVariable Long orderId) {
        serviceOrderService.delete(orderId);
        return ResponseEntity.ok().build();
    }

    // Модифицированный метод getAllOrders с поддержкой фильтрации
    @Operation(description = "Получить все заявки на услуги с фильтрацией")
    @GetMapping("/all-simple")
    public ResponseEntity<Page<ServiceOrderDTO>> getAllOrdersSimple(
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) Long serviceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdDate,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<ServiceOrderDTO> orders = serviceOrderService.getAllOrdersWithFilters(
                firstName, lastName, serviceId, createdDate, pageable);
        return ResponseEntity.ok(orders);
    }

    // Новый метод - обновить статус заявки
    @Operation(description = "Обновить статус заявки на услугу")
    @PutMapping("/{id}/status")
    public ResponseEntity<ServiceOrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        ServiceOrderDTO updatedOrder = serviceOrderService.updateOrderStatus(id, status);
        return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
    }
}
