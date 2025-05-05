package Proj.laba.mapper;

import Proj.laba.dto.GenericDTO;
import Proj.laba.model.GenericModel;
import jakarta.persistence.Entity;

import java.util.List;

public interface Mapper<E extends GenericModel, D extends GenericDTO> {
    E toEntity(D dto);
    D toDTO(E entity);
    List<E> toEntities(List<D> dtos);
    List<D> toDTOs(List<E> entities);
}
