import AppHeader from "@/src/components/AppHeader";
import { UPDATE_EXPENSE } from "@/src/graphql/mutation";
import { useMutation } from "@apollo/client";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert } from "react-native/Libraries/Alert/Alert";


export default function EditExpense(){
    const router = useRouter()
    const {expenseID, description: initialDescription, amount: initialAmount} = useLocalSearchParams<{expenseID: string, description: string, amount: string}>();
    const [description, setDescription] = useState(initialDescription || '')
    const [amount, setAmount] = useState(initialAmount || '')
    const [updateExpense, {loading}] = useMutation(UPDATE_EXPENSE, {
        refetchQueries:['GetGroupDetails']
    })
    const handleUpdate = async () => {
        if(! description.trim() || !amount.trim()){
            Alert.alert('Missing info', 'Please enter a description and amount')
            return
        }
        const parsedAmount = parseFloat(amount)
        if(isNaN(parsedAmount)|| parsedAmount <=0){
            Alert.alert('Invalid amount', 'Please enter a valid amount')
            return
        }
        try{
            await updateExpense({
                variables:{
                    id: expenseID,
                    input: {
                        description,
                        amount: parsedAmount
                    }
                }
            })
            router.back()
        }catch(error: any){
            Alert.alert('Error', error.message || 'Failed to update expense')
        }
    }
    return(
        <SafeAreaView style= {styles.safeArea}>
            <AppHeader title="Edit Expense" showBackButton={true} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding': 'height'} style={{flex: 1}} >
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps ='handled'>
                    <View style ={styles.amountContainer} >
                        <Text style={styles.currencySymbol}>₹</Text>
                        <TextInput
                        style ={styles.amountInput}
                        placeholder="0.00"
                        placeholderTextColor='#3D3D5c'
                        value={amount}
                        onChangeText={(text) => {
                            if(/^[0-9]*\.?[0-9]*$/.test(text)) setAmount(text)
                        }
                    }
                    keyboardType="decimal-pad"
                    editable={!loading}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style = {styles.label}>For what?</Text>
                        <TextInput
                        style = {styles.inputGroup}
                         placeholder="e.g. Groceries, Dinner, Taxi..."
                         placeholderTextColor="#3D3D5C"
                         value={description}
                         onChangeText={setDescription}
                         editable={!loading}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <View style={styles.footer}>
                <TouchableOpacity style={styles.buttonWrapper} onPress={handleUpdate} disabled={loading}>
                    <LinearGradient colors={loading ? ['#4C3ABA', '#2A4ABA'] : ['#8B5CF6', '#3B82F6']}
                    start={{x:0, y:0}}
                    end={{x:1, y:0}}
                    style={styles.gradientButton}
                    >
                        {loading ? (
                            <ActivityIndicator color="rgba(255,255,255,0.7)"/>
                        ): (
                            <Text style={styles.buttonText}>Save Changes</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#080812",
  },
  blobTopRight: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(139, 92, 246, 0.07)",
    top: -80,
    right: -80,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  
  // Amount styling
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  currencySymbol: {
    color: "#6B7280",
    fontSize: 48,
    fontWeight: "700",
    marginRight: 8,
    marginTop: 4,
  },
  amountInput: {
    color: "#FFFFFF",
    fontSize: 56,
    fontWeight: "800",
    minWidth: 100,
    textAlign: "center",
  },

  inputGroup: {
    marginBottom: 32,
  },
  label: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 12,
    marginLeft: 2,
  },
  input: {
    backgroundColor: "#090915",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 16,
    color: "#FFFFFF",
    fontSize: 16,
  },
  inputFocused: {
    borderColor: "rgba(139, 92, 246, 0.6)",
    backgroundColor: "#0C0C1A",
  },
  
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0E0E1C",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
  },
  chipSelected: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderColor: "#8B5CF6",
  },
  chipText: {
    color: "#9CA3AF",
    fontSize: 15,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 16,
    backgroundColor: "#080812",
  },
  buttonWrapper: {
    borderRadius: 12,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});