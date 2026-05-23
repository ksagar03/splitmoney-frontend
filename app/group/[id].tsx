import AppHeader from '@/src/components/AppHeader'
import { GET_GROUP_DETAILS } from '@/src/graphql/queries'
import { useAuthStore } from '@/src/store/useAuthStore'
import { useQuery } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet, View, Text, ActivityIndicator, FlatList, TouchableOpacity, } from 'react-native'
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
    const group = data?.group

    const renderExpenseItem = ({item}: {item: any}) => {
        const isCurrentUserPayer = item.payer.id === currentUser?.id
        const payerName = isCurrentUserPayer ? 'You' : item.payer.name

        return (
            <View style = {styles.expenseCard}>
                <View style = {styles.expenseInfo}>
                    <View style = {styles.expenseIconWrapper}>
                        <Ionicons name='receipt-outline' size={20} color="#8B5CF6"/>
                    </View>
                    <View>
                      <Text style = {styles.expenseDescription}>{item.description}</Text>
                      <Text style = {styles.expensePayer}>Paid by {payerName}</Text>
                    </View>
                </View>
                <Text style = {[styles.expenseAmount, isCurrentUserPayer && styles.amountOwedToYou]}>
                  ₹{item.amount.toFixed(2)}  
                </Text>
            </View>
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
            <AppHeader title={group.name} showBackButton={true}/>
            <View style ={styles.summaryContainer}>
                <LinearGradient colors={['rgba(139, 92, 246, 0.15)', 'rgba(59, 130, 246, 0.05)']}
                style={styles.summaryCard}
                >
                    <Text style={styles.summaryLabel}>Total Group Expenses</Text>
                    <Text style={styles.summaryTotal}>₹{(group.totalExpenses || 0).toFixed(2)}</Text>
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

const styles = StyleSheet.create( {
    safeArea:{},
    blobTopRight:{},
    centerContainer:{},
    errorText:{},

    summaryContainer:{},
    summaryCard:{},
    summaryLabel:{},
    summaryTotal:{},
    summaryMembers:{},

    listContainer:{},
    sectionTitle:{},
    listContent:{},
    emptyText:{},

    expenseCard:{},
    expenseInfo:{},
    expenseIconWrapper:{},
    expenseDescription:{},
    expensePayer:{},
    expenseAmount:{},
    amountOwedToYou:{},

    footer:{},
    buttonWrapper:{},
    gradientButton:{},
    buttonText:{}
})
export default GroupDetailsScreen
