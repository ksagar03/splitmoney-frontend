import AppHeader from "@/src/components/AppHeader";
import { CREATE_EXPENSE } from "@/src/graphql/mutation";
import { GET_GROUP_MEMBERS } from "@/src/graphql/queries";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useMutation, useQuery } from "@apollo/client";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";




export default function AddExpense(){
    const router = useRouter();
    const {groupId} = useLocalSearchParams<{groupId: string}>();
    const currentUser = useAuthStore(state => state.user)
    

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [payerId, setPayerId] = useState<string |null>(currentUser?.id || null);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const {data: groupData , loading: fetchingMembers} = useQuery(GET_GROUP_MEMBERS, {
        variables: {groupId},
        skip: !groupId
    })
    const [createExpense, {loading: creating}] = useMutation(CREATE_EXPENSE, {
        refetchQueries: ["GetGroupDetails", "GetGroupBalance"],
    })
    const handleCreate = async () => {
        if(!description.trim() || !amount.trim()){
            Alert.alert("Missing info", "please Enter a description and amount.")
            return;
        }
        if(!payerId){
            Alert.alert("Missing info", "please select a payer.")
            return;
        }
        const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid number greater than 0.");
      return;
    }
        try {
            await createExpense({
                variables: {
                    input: {
                        description,
                        amount: parsedAmount,
                        payerId,
                        groupId
                    },
                },
            })
            router.back()
        }catch(error: any){
            Alert.alert("Error", error.message || "Failed to add expense.")
        }
    }
    const members = groupData?.group?.members || []

    return(
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style = {styles.blobTopRight} />
            <AppHeader title="Add Expense" showBackButton={true} />
            <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding': 'height'}
             style={{flex: 1}}
             >
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style = {styles.amountContainer}>
                        <Text style = {styles.currencySymbol}>₹</Text>
                        <TextInput
                        style = {styles.amountInput}
                        placeholder="0.00"
                        placeholderTextColor="#3D3D5C"
                        value={amount}
                        onChangeText={(text) => {
                            const numericRegex = /^[0-9]*\.?[0-9]*$/;
                            if(numericRegex.test(text)) setAmount(text);
                        }}
                        keyboardType="decimal-pad"
                        autoFocus={true}
                        editable={!creating}
                        />

                    </View>
                    <View style ={styles.inputGroup}>
                        <Text style = {styles.label}>For what?</Text>
                        <TextInput
                        style={[styles.input, focusedField === 'description' && styles.inputFocused]}
                        placeholder="e.g. Groceries, Dinner, Taxi..."
                        placeholderTextColor='#3D3D5C'
                        onFocus={() => setFocusedField('description')}
                        onBlur={() => setFocusedField(null)}
                        value={description}
                        onChangeText={setDescription}
                        editable= {!creating}
                        />
                    </View>
                    <View style ={styles.inputGroup}>
                        <Text style = {styles.label}> Who paid?</Text>
                        {
                        fetchingMembers ? (<ActivityIndicator color='#8B5CF6' style = {{alignSelf: 'flex-start', margin: 8}}/>)
                        :(
                        <View style = {styles.chipContainer}>
                            {members.map((member: {id:string, name: string})=> {
                                const isSelected = payerId === member.id
                                const displayName = member.id === currentUser?.id ? "You" : member.name
                                
                                return(
                                    <TouchableOpacity
                                    key={member.id}
                                    activeOpacity={0.8}
                                    style = {[styles.chip, isSelected && styles.chipSelected]}
                                    onPress = {() => setPayerId(member.id)}
                                    >
                                        <Text style = {[styles.chipText, isSelected && styles.chipTextSelected]}>{displayName}</Text>
                                        {isSelected && 
                                        (<Ionicons name='checkmark' size={16} color="#FFFFFF" style ={{marginLeft: 4}}/>)}
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                        )
                    }
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <View style ={styles.footer}>

                <TouchableOpacity
                style = {styles.buttonWrapper}
                activeOpacity={0.8}
                onPress={handleCreate}
                disabled={creating}
                >
                    <LinearGradient
                    colors={ creating ? ['#4C3ABA', '#2A4ABA']: ['#8B5CF6', '#3B82F6']}
                    start={{x:0, y:0}}
                    end={{x:1, y:0}}
                    style = {styles.gradientButton}
                    >
                        {creating ?(
                            <ActivityIndicator color="rgba(255,255,255,0.7)"/>
                        ):(
                            <Text style = {styles.buttonText}> Add Expense</Text>
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