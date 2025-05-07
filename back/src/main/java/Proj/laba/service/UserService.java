// Файл: C:\Users\elfir\OneDrive\Рабочий стол\kursachik\back\src\main\java\Proj\laba\service\UserService.java

package Proj.laba.service;

import Proj.laba.dto.RegisterRequestDTO;
import Proj.laba.dto.RoleDTO;
import Proj.laba.dto.UserDTO;
import Proj.laba.mapper.GenericMapper;
import Proj.laba.model.Order;
import Proj.laba.model.Role;
import Proj.laba.model.User;
import Proj.laba.reposirory.OrderRepository;
import Proj.laba.reposirory.UserRepository;
import jakarta.persistence.criteria.Join;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.webjars.NotFoundException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService extends GenericService<User, UserDTO> {
    private final PasswordService passwordService;
    private final UserRepository userRepository;
    private final GenericMapper<User, UserDTO> mapper;
    private final RoleService roleService;
    private final ModelMapper modelMapper;

    @Autowired
    private OrderRepository orderRepository;

    public UserService(UserRepository userRepository,
                       GenericMapper<User, UserDTO> mapper,
                       PasswordService passwordService,
                       RoleService roleService,
                       ModelMapper modelMapper,
                       OrderRepository orderRepository) {
        super(userRepository, mapper);
        this.userRepository = userRepository;
        this.mapper = mapper;
        this.passwordService = passwordService;
        this.roleService = roleService;
        this.modelMapper = modelMapper;
        this.orderRepository = orderRepository;
    }

    public UserDTO register(RegisterRequestDTO request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Пользователь с таким email уже существует");
        }

        RoleDTO userRole;
        try {
            userRole = roleService.getRoleByTitle("USER");
        } catch (RuntimeException e) {
            RoleDTO newRole = new RoleDTO();
            newRole.setTitle("USER");
            newRole.setDescription("Обычный пользователь системы");
            userRole = roleService.create(newRole);
        }

        UserDTO newUser = new UserDTO();
        newUser.setPassword(passwordService.encodePassword(request.getPassword()));
        newUser.setEmail(request.getEmail());
        newUser.setFirstName(request.getFirstName());
        newUser.setLastName(request.getLastName());
        newUser.setPhone(request.getPhone());
        newUser.setRole(userRole);

        User userEntity = mapper.toEntity(newUser);
        userEntity.setCreatedWhen(LocalDateTime.now());

        try {
            User createdUser = userRepository.save(userEntity);
            return mapper.toDTO(createdUser);
        } catch (DataIntegrityViolationException e) {
            if (e.getMessage().contains("uniqueEmail")) {
                throw new RuntimeException("Пользователь с таким email уже существует");
            }
            if (e.getMessage().contains("ukdu5v5sr43g5bfnji4vb8hg5s3")) {
                throw new RuntimeException("Пользователь с таким номером телефона уже существует");
            } else {
                throw new RuntimeException("Ошибка при регистрации", e);
            }
        }
    }

    // Остальные методы класса остаются без изменений

    public UserDTO authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        if (passwordService.matches(password, user.getPassword())) {
            return mapper.toDTO(user);
        }
        throw new RuntimeException("Неверный пароль");
    }

    public Page<UserDTO> listAll(Pageable pageable) {
        Page<User> userPage = repository.findAll(pageable);
        return userPage.map(mapper::toDTO);
    }

    @Override
    @Transactional
    public void delete(final Long id) {
        // Перед удалением пользователя, удаляем все его заказы
        List<Order> orders = orderRepository.findAllByUserId(id);
        orderRepository.deleteAll(orders);

        // Удаляем пользователя
        repository.deleteById(id);
    }

    @Override
    public UserDTO update(UserDTO updatedUserDTO) {
        User existingUser = userRepository.findById(updatedUserDTO.getId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        existingUser.setFirstName(updatedUserDTO.getFirstName());
        existingUser.setLastName(updatedUserDTO.getLastName());
        existingUser.setEmail(updatedUserDTO.getEmail());
        existingUser.setPhone(updatedUserDTO.getPhone());

        // Get Role from DTO
        RoleDTO roleDTO = updatedUserDTO.getRole();

        // Ensure it's not null
        if(roleDTO != null) {
            // Map RoleDTO to Role entity
            Role role = modelMapper.map(roleDTO, Role.class);
            existingUser.setRole(role);
        } else {
            // Handle the case where role is null, e.g., set a default role
            RoleDTO defaultRole = roleService.getRoleByTitle("USER");
            Role role = modelMapper.map(defaultRole, Role.class);
            existingUser.setRole(role);
        }

        return mapper.toDTO(userRepository.save(existingUser));
    }

    public Page<UserDTO> listAllWithFilters(String firstName, String lastName, String email, String phone, String roleTitle, Pageable pageable) {
        Specification<User> spec = Specification.where(null);

        if (firstName != null && !firstName.isEmpty()) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("firstName")), "%" + firstName.toLowerCase() + "%"));
        }

        if (lastName != null && !lastName.isEmpty()) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("lastName")), "%" + lastName.toLowerCase() + "%"));
        }

        if (email != null && !email.isEmpty()) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), "%" + email.toLowerCase() + "%"));
        }

        if (phone != null && !phone.isEmpty()) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(root.get("phone"), "%" + phone + "%"));
        }

        if (roleTitle != null && !roleTitle.isEmpty()) {
            spec = spec.and((root, query, criteriaBuilder) -> {
                Join<User, Role> roleJoin = root.join("role");
                return criteriaBuilder.equal(roleJoin.get("title"), roleTitle);
            });
        }

        Page<User> userPage = userRepository.findAll(spec, pageable);
        return userPage.map(mapper::toDTO);
    }

}
