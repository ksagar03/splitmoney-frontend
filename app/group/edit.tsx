
import AppHeader from "@/src/components/AppHeader";
import { REMOVE_MEMBER, UPDATE_GROUP } from "@/src/graphql/mutation";
import { GET_GROUP_DETAILS } from "@/src/graphql/queries";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useMutation, useQuery } from "@apollo/client";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Platform, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditGroupScreen() {
    const {groupId, groupName:initialName} = useLocalSearchParams<{groupId:string, groupName: string}>();
    const router = useRouter()
    const currentUser = useAuthStore(state => state.user)
    const [name, setName] = useState(initialName || '')
    const [focused, setFocused] = useState(false)
    const {data, loading:groupLoading} = useQuery(GET_GROUP_DETAILS, {
        variables: { id: groupId },
        skip: !groupId,
        fetchPolicy: "cache-and-network"
    })
    const [updateGroup, {loading: saving}] = useMutation(UPDATE_GROUP, {
        refetchQueries:['GetGroups', 'GetGroupDetails']
    })
    const [removeMember, {loading: removing}] = useMutation(REMOVE_MEMBER, {
        refetchQueries:['GetGroupDetails']
    })
    const group = data?.group
    const isAdmin = group?.createdBy?.id === currentUser?.id

    useEffect(() => {
        if(group?.name && !name) setName(group.name)
    }, [group, name])

    const handleSave = async () => {
        if(!name.trim()){
            Alert.alert('Missing info', 
                'Group name cannot be empty.'
            )
            return
        }
        try{
            await updateGroup({variables: {groupId, input: {name: name.trim()}}})
            router.back()
        }catch(err: any){
            Alert.alert('Error', err.message || 'Could not update group.')
        }
    }
    const handleRemoveMember = (member: {id:string, name: string}) => {
        Alert.alert(
            `Remove ${member.name}?`,
            'This will only work if their balance is fully settled.',
            [
                {text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove', style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeMember({ variables: { groupId, userId: member.id } })
                        } catch (err: any) {
                            Alert.alert('Error', err.message || 'Could not remove member.')
                        }
                    }
                }
            ]
        )
    }

    const renderMember = ({item}: {item: {id: string; name :string}}) => {
        const isSelf = item.id === currentUser?.id 
        const isGroupAdmin = item.id === group?.createdBy?.id
    

    return (
        <View className="flex-row items-center bg-[#0E0E1C] p-3.5 rounded-xl border-white/5">
            <View className="w-10 h-10 rounded-full bg-[#8B5CF6]/15 justify-center items-center mr-3">
            <Text className="text-white text-base font-bold">{item.name.charAt(0)}</Text>
            </View>
            <View className="flex-1 flex-row items-center gap-2">
          <Text className="text-white text-[15px] font-semibold">
            {isSelf ? 'You' : item.name}
          </Text>
          {isGroupAdmin && (
            <Text className="text-[#8B5CF6] text-[11px] font-bold bg-[#8B5CF6]/15 px-2 py-0.5 rounded-md overflow-hidden">
              Admin
            </Text>
          )}
        </View>
        {!isSelf && !isGroupAdmin && (
          <TouchableOpacity
            className="p-2 rounded-lg bg-[#EF4444]/10"
            onPress={() => handleRemoveMember(item)}
            disabled={removing}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="person-remove-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    )
}
if (groupLoading && !data) {
    return (
      <SafeAreaView className="flex-1 bg-[#080812]">
        <AppHeader title="Edit Group" showBackButton />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#8B5CF6" size="large" />
        </View>
      </SafeAreaView>
    )
  }
  if (!isAdmin) {
    return (
      <SafeAreaView className="flex-1 bg-[#080812]">
        <AppHeader title="Edit Group" showBackButton />
        <View className="flex-1 justify-center items-center">
          <Text className="text-[#EF4444] text-base text-center px-6">
            Only the group admin can edit this group.
          </Text>
        </View>
      </SafeAreaView>
    )
  }
  return (
    <SafeAreaView className="flex-1 bg-[#080812]" edges={['top']}>
      <AppHeader title="Edit Group" showBackButton />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-1 px-6 pt-2">
          {/* Group name */}
          <View className="mb-8">
            <Text className="text-[#9CA3AF] text-[12px] font-semibold tracking-wider uppercase mb-3 ml-0.5">
              Group Name
            </Text>
            <TextInput
              className={`border rounded-xl p-4 text-white text-base transition-colors ${
                focused 
                  ? 'border-[#8B5CF6]/60 bg-[#0C0C1A]' 
                  : 'border-white/5 bg-[#090915]'
              }`}
              value={name}
              onChangeText={setName}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Group name"
              placeholderTextColor="#3D3D5C"
              editable={!saving}
            />
          </View>

          {/* Members list */}
          <View className="mb-8">
            <Text className="text-[#9CA3AF] text-[12px] font-semibold tracking-wider uppercase mb-3 ml-0.5">
              Members
            </Text>
            <FlatList
              data={group?.members || []}
              keyExtractor={(item) => item.id}
              renderItem={renderMember}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View className="h-2" />}
            />
          </View>
        </View>

        {/* Save button */}
        <View className="px-6 pb-9 pt-4">
          <TouchableOpacity 
            className="rounded-xl shadow-lg shadow-[#8B5CF6]/35 elevation-8" 
            onPress={handleSave} 
            disabled={saving} 
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={saving ? ['#4C3ABA', '#2A4ABA'] : ['#8B5CF6', '#3B82F6']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              className="rounded-xl py-4 items-center justify-center"
            >
              {saving ? (
                <ActivityIndicator color="rgba(255,255,255,0.7)" />
              ) : (
                <Text className="text-white text-base font-bold tracking-wide">Save Changes</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}