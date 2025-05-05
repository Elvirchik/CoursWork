package Proj.laba.service;

import Proj.laba.dto.RoleDTO;
import Proj.laba.mapper.GenericMapper;
import Proj.laba.model.Role;
import Proj.laba.reposirory.GenericRepository;
import Proj.laba.reposirory.RoleRepository;
import org.springframework.stereotype.Service;

@Service
public class RoleService extends GenericService<Role, RoleDTO> {
    private final GenericRepository<Role> repository;
    private final GenericMapper<Role, RoleDTO> mapper;

    public RoleService(GenericRepository<Role> repository,
                       GenericMapper<Role, RoleDTO> mapper) {
        super(repository, mapper);
        this.repository = repository;
        this.mapper = mapper;
    }

    public RoleDTO getRoleByTitle(String title) {
        Role role = ((RoleRepository)repository).findByTitle(title)
                .orElseThrow(() -> new RuntimeException("Role " + title + " not found"));
        return mapper.toDTO(role);
    }

    public RoleDTO getRole(Long id) {
        Role role = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role with ID: " + id + " not found"));
        return mapper.toDTO(role);
    }
}
