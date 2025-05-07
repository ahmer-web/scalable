import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { SigninValidation } from "@/lib/validation";
import { useLoginMutation } from "@/app/api/authApiSlice";
import { useToast } from "@/components/ui/use-toast";
import { IError } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/app/authSlice";

const SigninForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignin = async (user: z.infer<typeof SigninValidation>) => {
    try {
      const { accessToken } = await login(user).unwrap();

      dispatch(setCredentials(accessToken));

      form.reset();

      navigate("/");
    } catch (error) {
      const err = error as IError;

      if (err.data && err.data.message) toast({ title: err.data.message });
      else toast({ title: "Something went wrong!" });
    }
  };

  return (
    <Form {...form}>
      <div className="w-full bg-black max-w-[350px] p-10 border rounded-lg">
        <div className="flex justify-center mb-8">
          <img 
            src="/assets/images/logo.svg" 
            alt="logo" 
            className="h-16" 
          />
        </div>

        <form
          onSubmit={form.handleSubmit(handleSignin)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    className="bg-gray-50 text-dark-1 border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-400"
                    {...field}
                    placeholder="Email"
                  />
                </FormControl>
                <FormMessage className="text-[#FF5A5A] text-xs mt-1 font-medium" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="password"
                    className="bg-gray-50 text-dark-1 border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-400"
                    {...field}
                    placeholder="Password"
                  />
                </FormControl>
                <FormMessage className="text-[#FF5A5A] text-xs mt-1 font-medium" />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 font-semibold"
          >
            {isLoading ? (
              <PulseLoader color="#fff" size={8} />
            ) : (
              "Log in"
            )}
          </Button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/sign-up"
            className="text-blue-600 font-semibold hover:text-blue-800"
          >
            Sign up
          </Link>
        </p>
      </div>
    </Form>
  );
};
export default SigninForm;
