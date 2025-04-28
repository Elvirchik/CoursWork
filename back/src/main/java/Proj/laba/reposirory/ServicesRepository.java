package Proj.laba.reposirory;

import Proj.laba.model.Services;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ServicesRepository extends GenericRepository<Services> {

    // Найти все услуги, включая удаленные
    List<Services> findAll();


    // Найти все неудаленные услуги
    @Query("SELECT s FROM Services s WHERE s.deleted = false")
    List<Services> findAllActive();

    // Мягкое удаление (обновление флага deleted)
    @Modifying
    @Transactional
    @Query("UPDATE Services s SET s.deleted = true WHERE s.id = :id")
    void softDelete(@Param("id") Long id);
}
