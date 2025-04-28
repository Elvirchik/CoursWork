package Proj.laba.service;

import Proj.laba.dto.ServicesDTO;
import Proj.laba.mapper.ServicesMapper;
import Proj.laba.model.Services;
import Proj.laba.reposirory.ServicesRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServicesService extends GenericService<Services, ServicesDTO> {

    private final ServicesRepository servicesRepository;
    private final ServicesMapper servicesMapper;

    public ServicesService(ServicesRepository repository, ServicesMapper mapper) {
        super(repository, mapper);
        this.servicesRepository = repository;
        this.servicesMapper = mapper;
    }

    @Override
    public List<ServicesDTO> listAll() {
        List<Services> services = servicesRepository.findAllActive();
        return services.stream()
                .map(servicesMapper::toDTO)
                .collect(Collectors.toList());
    }


    @Override
    public ServicesDTO create(ServicesDTO dto) {
        Services entity = servicesMapper.toEntity(dto);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setDeleted(false);
        Services saved = servicesRepository.save(entity);
        return servicesMapper.toDTO(saved);
    }

    @Override
    public ServicesDTO update(ServicesDTO dto) {
        Services entity = servicesMapper.toEntity(dto);
        entity.setUpdatedAt(LocalDateTime.now());
        Services updated = servicesRepository.save(entity);
        return servicesMapper.toDTO(updated);
    }

    @Transactional
    public void softDelete(Long id) {
        servicesRepository.softDelete(id);
    }
}
