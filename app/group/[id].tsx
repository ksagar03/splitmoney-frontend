import AppHeader from '@/src/components/AppHeader'
import { DELETE_EXPENSE, DELETE_GROUP, LEAVE_GROUP } from '@/src/graphql/mutation'
import { GET_GROUP_DETAILS } from '@/src/graphql/queries'
import { useAuthStore } from '@/src/store/useAuthStore'
import { useMutation, useQuery } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import * as Haptics from 'expo-haptics'
import { StyleSheet, View, Text, ActivityIndicator, FlatList, TouchableOpacity, Alert, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'


const GroupDetailsScreen = () => {
    const {id} = useLocalSearchParams<{id: string}>()
    const router = useRouter()
    const currentUser = useAuthStore(state => state.user)
    const {data, loading, error, refetch} = useQuery(GET_GROUP_DETAILS, {
        variables: {id},
        skip: !id,
        fetchPolicy: 'cache-and-network'
    })
    const [deleteExpense] = useMutation(DELETE_EXPENSE, {
      refetchQueries:['GetGroupDetails']
    })
    const [deleteGroup] = useMutation(DELETE_GROUP, {
      refetchQueries:['GetGroups']
    })
    const [leaveGroup] = useMutation(LEAVE_GROUP, {
      refetchQueries:['GetGroups']
    })
    const group = data?.group
    const isAdmin = group?.createdBy?.id === currentUser?.id

    const canEditExpense = (item: any) => item.payer.id === currentUser?.id || 
    item.createdBy?.id === currentUser?.id || isAdmin

    const handleGroupMenu = () => {
      if(Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        if(isAdmin){
          Alert.alert(group.name , 'Admin options', [
            {
              text: 'Edit Group',
              onPress: () => router.push({
                pathname: '/group/edit' as any,
                params: { groupId: group.id, groupName: group.name }
              })
            },
            {
              text: 'Delete Group',
              style: 'destructive',
              onPress: () => 
                Alert.alert('Delete Group', `Delete "${group.name}"? All expense will be lost`, [
                  {
                    text: 'Cancel',
                    style: 'cancel'
                  },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await deleteGroup({ variables: { id: group.id } })
                      } catch (error: any) {
                        Alert.alert('Error', error.message || 'Could not delete group. Please try again later.')
                      }
                    },
                  },
                ])
            },
            {text: 'Cancel', style: 'cancel'}
          ])
        }else {
          Alert.alert(group.name, '',[
            {
              text: 'Leave Group',
              style: 'destructive',
              onPress: () => {
                Alert.alert('Leave Group', 'You can only leave if your balance is settled',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel'
                    },
                    {
                      text: 'Leave',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await leaveGroup({ variables: { groupId: group.id } })
                          router.replace('/(tabs)' as any )
                        } catch (error: any) {
                          Alert.alert('Error', error.message || 'Could not leave group. Please try again later.')
                        }
                      },
                    },
                  ]
                )
              }
            },
            {text: 'Cancel', style: 'cancel'}
          ])
        }
    }

    const menuButton = group ? (
      <TouchableOpacity onPress={handleGroupMenu} style ={styles.menuButton} hitSlop={{top:8, bottom: 8, left:8, right:8 }} >
        <Ionicons name ="ellipsis-vertical" size={22} color="#FFFFFF"/>
      </TouchableOpacity>

    ): undefined

    const handleExpenseOptions = (item: any) => {
      if(!canEditExpense(item)) return
      if(Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      Alert.alert(item.description, 'What do you want to do?', [
        {
          text: 'Edit',
          onPress: () => 
            router.push({
            pathname: '/expense/edit-expense' as any,
            params:{expenseId: item.id, description: item.description, amount: String(item.amount)}
          })
        },
       {
        text: 'Delete',
        style: 'destructive',
        onPress:() => 
          Alert.alert('Delete Expense', `Delete ${item.description}?`, [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                try{
                  await deleteExpense({variables:{id: item.id}})
                }catch (error: any) {
                  Alert.alert('Error', error.message || 'Could not delete expense. Please try again later.')
                }
              },
            },
          ]),
       },
       {text: 'Cancel', style: 'cancel'}
      ])
    }

    const renderExpenseItem = ({item}: {item: any}) => {
        const isCurrentUserPayer = item.payer.id === currentUser?.id
        const payerName = isCurrentUserPayer ? 'You' : item.payer.name
        const canEdit = canEditExpense(item)

        return (
          <TouchableOpacity
            onLongPress={() => canEdit && handleExpenseOptions(item)}
            activeOpacity={0.8}
          >
            <View style={styles.expenseCard}>
                <View style={styles.expenseInfo}>
                    <View style={styles.expenseIconWrapper}>
                        <Ionicons name='receipt-outline' size={20} color="#8B5CF6"/>
                    </View>
                    <View>
                      <Text style={styles.expenseDescription}>{item.description}</Text>
                      <Text style={styles.expensePayer}>Paid by {payerName}</Text>
                    </View>
                </View>
                <View style={styles.expenseRight}>
                  <Text style={[styles.expenseAmount, isCurrentUserPayer && styles.amountOwedToYou]}>
                    ₹{item.amount.toFixed(2)}
                  </Text>
                  {Platform.OS === 'web' && canEdit &&  (
                    <>
                      <TouchableOpacity
                        onPress={() => router.push({
                          pathname: '/expense/edit-expense' as any,
                          params: { expenseId: item.id, description: item.description, amount: String(item.amount) }
                        })}
                        style={styles.actionBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="create-outline" size={16} color="#8B5CF6" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={async () => {
                          if (!confirm(`Delete "${item.description}"?`)) return
                          try {
                            await deleteExpense({ variables: { id: item.id } })
                          } catch (err: any) {
                            Alert.alert('Error', err.message || 'Could not delete expense.')
                          }
                        }}
                        style={styles.actionBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
            </View>
          </TouchableOpacity>
        )
    }
    if(loading && !data){
        return (
            <SafeAreaView style={styles.safeArea}>
                <AppHeader title='Loading...' showBackButton={true} />
                <View style ={styles.centerContainer}>
                    <ActivityIndicator color="#8B5CF6" size='large' />
                </View>
            </SafeAreaView>
        )
    }
    if(error || !group){
        return (
            <SafeAreaView style={styles.safeArea}>
                <AppHeader title='Error' showBackButton={true} />
                <View style = {styles.centerContainer}>
                    <Text style = {styles.errorText}> Could not load group details. Please try again later.</Text>
                </View>
            </SafeAreaView>
        )
    }
    return (
        <SafeAreaView style = {styles.safeArea} edges={['top']}>
            <View style={styles.blobTopRight} />
            <AppHeader title={group.name} showBackButton rightElement={menuButton}/>
            <View style ={styles.summaryContainer}>
                <LinearGradient colors={['rgba(139, 92, 246, 0.15)', 'rgba(59, 130, 246, 0.05)']}
                style={styles.summaryCard}
                >
                    <Text style={styles.summaryLabel}>Total Group Expenses</Text>
                    <Text style={styles.summaryTotal}>₹{(group.totalExpense || 0).toFixed(2)}</Text>
                    <Text style={styles.summaryMembers}>{group.members.length} Members</Text>
                </LinearGradient>
            </View>
            <View style ={styles.listContainer}>
                <Text style = {styles.sectionTitle}>Recent Expenses</Text>
                <FlatList
                data={group.expenses || []}
                renderItem={renderExpenseItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle = {styles.listContainer}
                showsVerticalScrollIndicator={false}
                onRefresh={refetch}
                refreshing={loading}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No expense yet. Time to spend some money!</Text>
                }
                />
            </View>
            <View style ={styles.footer}>
                <TouchableOpacity
                style = {styles.buttonWrapper}
                activeOpacity={0.8}
                onPress={() => router.push({pathname: '/group/add-expense' as any, params: {groupId: group.id}})}
                >
                    <LinearGradient
                    colors={['#8B5CF6','#3B82F6' ]}
                    start={{x:0,y:0}}
                    end = {{x:1, y:0}}
                    style={styles.gradientButton}
                    >
                        <Ionicons name='add-circle-outline' size={24} color ='#FFFFFF' style= {{ marginRight: 8}}/>
                        <Text style = {styles.buttonText}> Add Expense</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#080812' },
  blobTopRight: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(139, 92, 246, 0.07)',
    top: -80,
    right: -80,
  },
  centerContainer: { flex: 1, justifyContent: 'center', alignContent: 'center' },
  errorText: { color: '#EF4444', fontSize: 16 },
  menuButton: { padding: 4 },
  summaryContainer: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 24 },
  summaryCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  summaryLabel: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  summaryTotal: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', marginBottom: 4 },
  summaryMembers: { color: '#6B7280', fontSize: 14, fontWeight: '500' },

  listContainer: { flex: 1, paddingHorizontal: 24 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  listContent: { paddingBottom: 100 },
  emptyText: { color: '#6B7280', fontSize: 14, textAlign: 'center', marginTop: 32 },

  expenseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0E0E1C',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 13,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  expenseInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  expenseIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseDescription: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 2 },
  expensePayer: { color: '#9CA3AF', fontSize: 13 },
  expenseRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expenseAmount: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  amountOwedToYou: { color: '#10B981' },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 36,
    backgroundColor: 'rgba(8, 8, 18, 0.9)',
  },
  buttonWrapper: {
    borderRadius: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientButton: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
})
export default GroupDetailsScreen
