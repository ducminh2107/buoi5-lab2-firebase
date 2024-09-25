import { React, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import Icon from "react-native-vector-icons/FontAwesome";
import { Formik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Email không đúng định dạng!")
    .required("Email là bắt buộc!"),
  password: Yup.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự!")
    .required("Mật khẩu là bắt buộc!"),
});

export default function LoginScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      navigation.replace("Home");
    } catch (error) {
      Alert.alert("Lỗi đăng nhập", "Tài khoản hoặc mật khẩu không đúng");
    }
    setSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/475024unc/hinh-anh-lauriel-dep_021751690.png",
          }}
          style={styles.image}
        />
      </View>
      <Text style={styles.title}>Đăng Nhập</Text>

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isSubmitting,
        }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              keyboardType="email-address"
            />
            {touched.email && errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Mật khẩu"
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? "eye-slash" : "eye"}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <Button
              title="Đăng nhập"
              onPress={handleSubmit}
              disabled={isSubmitting}
              color="green"
            />

            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.link}>Chưa có tài khoản? Đăng ký ngay</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("ResetPassword")}
            >
              <Text style={styles.link}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  imageContainer: {
    alignItems: "center", // Căn giữa theo chiều ngang
    justifyContent: "center", // Căn giữa theo chiều dọc
    marginBottom: 20,
  },
  image: {
    width: 100, // Chiều rộng
    height: 100, // Chiều cao (bằng chiều rộng để tạo hình tròn)
    borderRadius: 50, // Bán kính bo góc (bằng một nửa chiều rộng)
    marginBottom: 20,
    resizeMode: "cover",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  inputPassword: {
    flex: 1,
  },
  errorText: {
    color: "red",
    textAlign: "left",
    marginTop: -10,
    marginBottom: 10,
  },
  link: {
    color: "#1e90ff",
    textAlign: "center",
    marginTop: 15,
  },
});
