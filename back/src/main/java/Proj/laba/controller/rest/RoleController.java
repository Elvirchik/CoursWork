package Proj.laba.controller.rest;

import Proj.laba.dto.RoleDTO;
import Proj.laba.mapper.RoleMapper; // Импортируем RoleMapper
import Proj.laba.model.Role;
import Proj.laba.service.RoleService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/roles")
@Tag(name = "Роли",description = "Контроллер для работы с ролями компании")
public class RoleController extends GenericController<Role, RoleDTO> {

    public RoleController(RoleService roleService, RoleMapper roleMapper) { //  Добавлен RoleMapper
        super(roleService, roleMapper); // Передача roleMapper в конструктор GenericController
    }
}
