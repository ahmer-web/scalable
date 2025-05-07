import { useSignupMutation } from "@/app/api/authApiSlice";
import {
  Form,
  Button,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { useToast } from "@/components/ui/use-toast";
import { IError } from "@/lib/utils";
import { SignupValidation } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import { z } from "zod";
import { setCredentials } from "@/app/authSlice";

const SignupForm = () => {
  const [signUp, { isLoading: isCreatingAccount }] = useSignupMutation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      role: undefined,
    },
  });

  const handleSignup = async (user: z.infer<typeof SignupValidation>) => {
    try {
      const { accessToken } = await signUp(user).unwrap();
      dispatch(setCredentials(accessToken));
      form.reset();
      navigate("/");
    } catch (error) {
      const err = error as IError;
      if (err.data?.message) {
        toast({ title: err.data.message });
      } else {
        toast({ title: "Something went wrong!" });
      }
    }
  };

  return (
    <Form {...form}>
      <div className="w-full bg-black max-w-[350px] p-8 border rounded-lg">
        <div className="flex justify-center mb-8">
          <img 
            src="/assets/images/logo.svg" 
            alt="logo" 
            className="h-16" 
          />
        </div>

        <h2 className="text-xl font-semibold text-white text-center mb-6">
          Sign up to see photos and videos from your friends.
        </h2>

        <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4">
          {[
            { name: "name", placeholder: "Full Name", type: "text" },
            { name: "username", placeholder: "Username", type: "text" },
            { name: "email", placeholder: "Email", type: "email" },
            { name: "password", placeholder: "Password", type: "password" },
            { 
              name: "role",
              placeholder: "Select Role",
              type: "select",
              options: [
                { value: "creator", label: "Creator" },
                { value: "consumer", label: "Consumer" }
              ]
            },
          ].map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name as keyof z.infer<typeof SignupValidation>}
              render={({ field: formField }) => (
                <FormItem>
                  <FormControl>
                    {field.type === "select" ? (
                      <Select 
                        onValueChange={formField.onChange} 
                        value={formField.value}
                      >
                        <SelectTrigger className="w-full bg-gray-50 text-dark-1 border-gray-300 focus:ring-1 focus:ring-gray-400">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem 
                              key={option.value} 
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={field.type}
                        className="bg-gray-50 text-dark-1 border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-400"
                        placeholder={field.placeholder}
                        {...formField}
                      />
                    )}
                  </FormControl>
                  <FormMessage className="text-[#FF5A5A] text-xs mt-1 font-medium" />
                </FormItem>
              )}
            />
          ))}

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 font-semibold text-white rounded-md"
            disabled={isCreatingAccount}
          >
            {isCreatingAccount ? (
              <PulseLoader color="#fff" size={8} />
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-blue-600 font-semibold hover:text-blue-800"
          >
            Log in
          </Link>
        </p>
      </div>
    </Form>
  );
};

export default SignupForm;