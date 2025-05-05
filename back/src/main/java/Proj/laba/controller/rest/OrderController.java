package Proj.laba.controller.rest;

import Proj.laba.dto.OrderDTO;
import Proj.laba.mapper.OrderMapper;
import Proj.laba.model.Order;
import Proj.laba.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController extends GenericController<Order, OrderDTO> {

    private final OrderService orderService;
    private final OrderMapper orderMapper;

    public OrderController(OrderService orderService, OrderMapper orderMapper) {
        super(orderService, orderMapper);
        this.orderService = orderService;
        this.orderMapper = orderMapper;
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/create")
    public ResponseEntity<OrderDTO> createOrder(@RequestBody OrderDTO orderDTO) {
        OrderDTO createdOrder = orderService.create(orderDTO);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<OrderDTO>> getAllUserOrders(
            @PathVariable Long userId,
            @PageableDefault(size = 5) Pageable pageable) {
        return new ResponseEntity<>(orderService.getAllUserOrders(userId, pageable), HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<Page<OrderDTO>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String customerFirstName,
            @RequestParam(required = false) String customerLastName,
            @RequestParam(required = false) String customerEmail,
            @RequestParam(required = false) String customerPhone,
            @PageableDefault(size = 5) Pageable pageable) {
        Page<OrderDTO> orders = orderService.getAllOrders(status, customerFirstName, customerLastName, customerEmail, customerPhone, pageable);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        OrderDTO updatedOrder = orderService.updateOrderStatus(id, status);
        return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
    }
}
