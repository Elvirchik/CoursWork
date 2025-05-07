package Proj.laba.controller.rest;

import Proj.laba.dto.UserDTO;
import Proj.laba.mapper.UserMapper;
import Proj.laba.model.User;
import Proj.laba.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@Tag(name = "Пользователи", description = "Контроллер для работы с пользователями компании")
public class UserController extends GenericController<User, UserDTO> {

    private final UserService userService;
    private final UserMapper userMapper;

    public UserController(UserService userService, UserMapper userMapper) {
        super(userService, userMapper);
        this.userService = userService;
        this.userMapper = userMapper;
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<UserDTO> updateUserInfo(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        userDTO.setId(id);
        UserDTO updatedUser = userService.update(userDTO);
        return ResponseEntity.ok(updatedUser);
    }

    @Operation(description = "Получить всех пользователей с пагинацией")
    @GetMapping("/getAll")
    public ResponseEntity<Page<UserDTO>> getAllUsers(
            @PageableDefault(size = 5) Pageable pageable) {
        Page<UserDTO> users = userService.listAll(pageable);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @Operation(description = "Удалить пользователя")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @Operation(description = "Получить всех пользователей с пагинацией и фильтрацией")
    @GetMapping("/search")
    public ResponseEntity<Page<UserDTO>> getAllUsers(
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String roleTitle,
            @PageableDefault(size = 5) Pageable pageable) {
        Page<UserDTO> users = userService.listAllWithFilters(firstName, lastName, email, phone, roleTitle, pageable);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

}
