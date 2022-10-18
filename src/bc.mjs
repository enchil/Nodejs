//mjs寫法 有自動全域async
import bcrypt from 'bcryptjs';

    const h =await bcrypt.hash('123123', 10);
    console.log(h);

    const hashstr = '$2a$10$Ao9QPq706CwXqiEY6HDswu9uVxA4GJIKXJjLwwfBhuYT2ol9G6St6';

    console.log(await bcrypt.compare('123123', hashstr))//true


