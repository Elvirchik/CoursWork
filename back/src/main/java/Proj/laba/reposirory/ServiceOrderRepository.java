package Proj.laba.reposirory;

import Proj.laba.model.ServiceOrder;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceOrderRepository extends GenericRepository<ServiceOrder>, JpaSpecificationExecutor<ServiceOrder> {
    List<ServiceOrder> findAllByUserId(Long userId);
    List<ServiceOrder> findAllByIsDeletedFalse(); // Добавляем метод для выборки неудаленных записей
}
