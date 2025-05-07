package Proj.laba.service;

import Proj.laba.dto.ServiceOrderDTO;
import Proj.laba.mapper.ServiceOrderMapper;
import Proj.laba.model.ServiceOrder;
import Proj.laba.model.Services;
import Proj.laba.model.User;
import Proj.laba.reposirory.ServiceOrderRepository;
import Proj.laba.reposirory.ServicesRepository;
import Proj.laba.reposirory.UserRepository;
import jakarta.persistence.criteria.Join;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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

        // Установка даты заказа - используем текущую дату, если не указана
        if (dto.getOrderDate() != null) {
            serviceOrder.setOrderDate(dto.getOrderDate());
        } else {
            serviceOrder.setOrderDate(LocalDate.now());
        }

        // Установка статуса "В обработке"
        serviceOrder.setStatus("В обработке");

        // Устанавливаем флаг deleted = false
        serviceOrder.setDeleted(false);

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

        // Обновляем также статус, если он передан
        if (dto.getStatus() != null) {
            order.setStatus(dto.getStatus());
        }

        ServiceOrder updatedOrder = serviceOrderRepository.save(order);
        return serviceOrderMapper.toDTO(updatedOrder);
    }

    // Новый метод - обновить статус заявки
    public ServiceOrderDTO updateOrderStatus(Long id, String status) {
        ServiceOrder order = serviceOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Заявка не найдена"));

        order.setStatus(status);
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

    public Page<ServiceOrderDTO> getAllOrdersWithFilters(
            String firstName, String lastName, Long serviceId, LocalDate createdDate, Pageable pageable) {

        // Создаем спецификации для фильтрации
        Specification<ServiceOrder> spec = Specification.where(null);

        if (firstName != null && !firstName.isEmpty()) {
            spec = spec.and((root, query, cb) -> {
                Join<ServiceOrder, User> userJoin = root.join("user");
                return cb.like(cb.lower(userJoin.get("firstName")), "%" + firstName.toLowerCase() + "%");
            });
        }

        if (lastName != null && !lastName.isEmpty()) {
            spec = spec.and((root, query, cb) -> {
                Join<ServiceOrder, User> userJoin = root.join("user");
                return cb.like(cb.lower(userJoin.get("lastName")), "%" + lastName.toLowerCase() + "%");
            });
        }

        if (serviceId != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("service").get("id"), serviceId));
        }

        if (createdDate != null) {
            spec = spec.and((root, query, cb) -> {
                // Преобразуем LocalDate в LocalDateTime
                LocalDateTime startOfDay = createdDate.atStartOfDay();
                LocalDateTime endOfDay = createdDate.atTime(23, 59, 59);
                return cb.between(root.get("createdWhen"), startOfDay, endOfDay);
            });
        }

        // Добавляем фильтр, чтобы исключить мягко удаленные записи
        spec = spec.and((root, query, cb) -> cb.isNull(root.get("deletedWhen")));

        Page<ServiceOrder> orderPage = serviceOrderRepository.findAll(spec, pageable);
        return orderPage.map(serviceOrderMapper::toDTO);
    }
}
