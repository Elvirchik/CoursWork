package Proj.laba.service;

import Proj.laba.dto.ServiceOrderDTO;
import Proj.laba.mapper.ServiceOrderMapper;
import Proj.laba.model.ServiceOrder;
import Proj.laba.model.Services;
import Proj.laba.model.User;
import Proj.laba.reposirory.ServiceOrderRepository;
import Proj.laba.reposirory.ServicesRepository;
import Proj.laba.reposirory.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ServiceOrderService extends GenericService<ServiceOrder, ServiceOrderDTO> {
    private final ServiceOrderRepository serviceOrderRepository;
    private final ServiceOrderMapper serviceOrderMapper;
    private final UserService userService;
    private final ServicesService servicesService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServicesRepository servicesRepository;

    public ServiceOrderService(
            ServiceOrderRepository serviceOrderRepository,
            ServiceOrderMapper serviceOrderMapper,
            UserService userService,
            ServicesService servicesService) {
        super(serviceOrderRepository, serviceOrderMapper);
        this.serviceOrderRepository = serviceOrderRepository;
        this.serviceOrderMapper = serviceOrderMapper;
        this.userService = userService;
        this.servicesService = servicesService;
    }

    @Override
    public ServiceOrderDTO create(ServiceOrderDTO dto) {
        ServiceOrder serviceOrder = new ServiceOrder();

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        Services service = servicesRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new RuntimeException("Услуга не найдена"));

        serviceOrder.setUser(user);
        serviceOrder.setService(service);
        serviceOrder.setPrice(dto.getPrice());
        serviceOrder.setComment(dto.getComment());
        serviceOrder.setCreatedWhen(LocalDateTime.now());

        ServiceOrder savedOrder = serviceOrderRepository.save(serviceOrder);
        return serviceOrderMapper.toDTO(savedOrder);
    }

    public List<ServiceOrderDTO> getAllUserOrders(Long userId) {
        List<ServiceOrder> orders = serviceOrderRepository.findAllByUserId(userId);
        return serviceOrderMapper.toDTOs(orders);
    }

    // Новый метод - получить все заявки (с фильтрацией неудаленных)
    public List<ServiceOrderDTO> getAllOrders() {
        List<ServiceOrder> orders = serviceOrderRepository.findAllByIsDeletedFalse();
        return serviceOrderMapper.toDTOs(orders);
    }

    // Новый метод - обновить детали заявки (цену и комментарий)
    public ServiceOrderDTO updateOrderDetails(ServiceOrderDTO dto) {
        ServiceOrder order = serviceOrderRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Заявка не найдена"));

        // Обновляем только цену и комментарий
        if (dto.getPrice() != null) {
            order.setPrice(dto.getPrice());
        }

        if (dto.getComment() != null) {
            order.setComment(dto.getComment());
        }

        ServiceOrder updatedOrder = serviceOrderRepository.save(order);
        return serviceOrderMapper.toDTO(updatedOrder);
    }

    // Мягкое удаление
    public void softDelete(Long id) {
        ServiceOrder order = serviceOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Заявка не найдена"));

        order.setDeleted(true);
        order.setDeletedWhen(LocalDateTime.now());
        // Можно добавить также order.setDeletedBy(username) если используете систему аудита

        serviceOrderRepository.save(order);
    }
}
