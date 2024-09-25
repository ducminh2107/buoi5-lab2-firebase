import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { auth, firestore } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Formik } from "formik";
import * as Yup from "yup";

// Cập nhật quy tắc xác thực cho tên
const validationSchema = Yup.object().shape({
  name: Yup.string()
    .matches(/^[\p{L}\s]*$/u, "Tên không được chứa số") // Cho phép chữ cái Unicode (bao gồm tiếng Việt)
    .nullable(),
  age: Yup.number()
    .typeError("Tuổi phải là một số")
    .positive("Tuổi phải là số dương")
    .integer("Tuổi phải là số nguyên")
    .nullable(),
});

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const inactivityTimeoutRef = useRef(null);
  const user = auth.currentUser;
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && !isLoggingOut) {
        Alert.alert(
          "Phiên đăng nhập hết hạn",
          "Vui lòng đăng nhập lại để tiếp tục."
        );
        navigation.replace("Login");
      }
    });

    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setName(userData.name || "");
          setAge(userData.age || "");
        }
      }
      setLoading(false);
    };

    fetchUserData();
    startInactivityTimer();

    return () => {
      clearTimeout(inactivityTimeoutRef.current);
      unsubscribe();
    };
  }, [navigation, user, isLoggingOut]);

  const startInactivityTimer = () => {
    clearTimeout(inactivityTimeoutRef.current);
    inactivityTimeoutRef.current = setTimeout(() => {
      Alert.alert(
        "Phiên đăng nhập hết hạn",
        "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại."
      );
      auth.signOut();
      navigation.replace("Login");
    }, 600000); // 10 phút
  };

  const handleInteraction = () => {
    console.log("Người dùng tương tác, khởi động lại bộ đếm thời gian");
    startInactivityTimer();
  };

  const handleSave = async (values) => {
    try {
      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(
          userDocRef,
          {
            name: values.name,
            age: values.age,
            email: user.email,
          },
          { merge: true }
        );

        Alert.alert("Thành công", "Dữ liệu đã được lưu thành công!");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại!");
      console.error("Error saving document: ", error);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await auth.signOut();
    navigation.replace("Login");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handleInteraction}>
      <View style={styles.container}>
        <Text style={styles.welcome}>Chào mừng đến với LSB</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={user?.email}
          editable={false} // Không cho phép chỉnh sửa
        />

        <Formik
          initialValues={{ name: name || "", age: age || "" }}
          validationSchema={validationSchema}
          onSubmit={handleSave}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <>
              <TextInput
                style={styles.input}
                placeholder="Tên"
                onChangeText={(text) => {
                  handleChange("name")(text);
                  handleInteraction(); // Reset timer khi người dùng nhập tên
                }}
                onBlur={handleBlur("name")}
                value={values.name}
              />
              {errors.name && touched.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}

              <TextInput
                style={styles.input}
                placeholder="Tuổi"
                onChangeText={(text) => {
                  handleChange("age")(text);
                  handleInteraction(); // Reset timer khi người dùng nhập tuổi
                }}
                onBlur={handleBlur("age")}
                value={values.age}
                keyboardType="numeric"
              />
              {errors.age && touched.age && (
                <Text style={styles.errorText}>{errors.age}</Text>
              )}

              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", // Căn giữa theo chiều ngang
  },
  welcome: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "green", // Màu nền cho nút Lưu
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  logoutButton: {
    backgroundColor: "#FF5733", // Màu nền cho nút Đăng xuất
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#FFFFFF", // Màu chữ
    fontSize: 16,
  },
});
