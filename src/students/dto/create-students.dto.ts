import { IsString, IsNotEmpty, IsEmail, IsInt, Min, Max, IsPositive} from "class-validator";

export class CreateStudentDto{
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsInt()
    @IsPositive()
    age: number;

    @IsString()
    @IsNotEmpty()
    career: string;

    @IsInt()
    @Min(1)
    @Max(10)
    semester: number;


}