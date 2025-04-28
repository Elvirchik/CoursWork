package Proj.laba.mapper;

import Proj.laba.dto.RoleDTO;
import Proj.laba.model.Role;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class RoleMapper extends GenericMapper<Role, RoleDTO> {

    public RoleMapper(ModelMapper modelMapper) {
        super(Role.class, RoleDTO.class, modelMapper);
    }

    @Override
    protected void mapSpecificFields(RoleDTO source, Role destination) {
        // Специфическое мапирование, если необходимо
    }

    @Override
    protected void mapSpecificFields(Role source, RoleDTO destination) {
        // Специфическое мапирование, если необходимо
    }

    @Override
    protected void setupMapper() {
        // Настройка специфического мапирования, если необходимо
    }

    @Override
    protected List<Long> getIds(Role entity) {
        return Collections.singletonList(entity.getId());
    }
}
