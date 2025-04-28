package Proj.laba.reposirory;

import Proj.laba.model.User;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends GenericRepository<User> {
    Optional<User> findByEmail(String email);
}
