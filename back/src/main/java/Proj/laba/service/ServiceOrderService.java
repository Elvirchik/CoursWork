package Proj.laba.service;

import Proj.laba.dto.ServiceOrderDTO;
import Proj.laba.dto.ServicesDTO;
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
    private ServicesRepository servicesRepository; // Добавляем прямой доступ к репозиторию услуг

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

        // Используем userRepository вместо userService.repository
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        // Используем servicesRepository вместо доступа через servicesService.repository
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
}
