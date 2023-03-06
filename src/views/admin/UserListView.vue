<script setup lang="ts">
import type { User } from 'firebase/auth';
import { getFunctions, httpsCallable } from "firebase/functions";

import { ref, onMounted } from 'vue';

import {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
    Switch,
    SwitchGroup,
    SwitchLabel,
} from '@headlessui/vue'

import { fetchAllUsers } from '../../firebase';

import TabTemplate from '../TabTemplate.vue'

import { useAuthStore } from '../../stores/auth';


const authStore = useAuthStore();

const users = ref();
const allGroups = ref();
onMounted(async () => {
    users.value = ((await fetchAllUsers()) as any).users;
    allGroups.value = authStore.isAdmin ? await authStore.getAllGroups() : authStore.userGroups;
    // TODO filter groups where he is Admin
});

const editUser = ref<any | null>(null)

const availableGroups = ref();

function refreshAvailableGroups() {
    const user = editUser.value;
    const t = { ...allGroups.value }
    const assignedGroups = Object.keys(user.privileges);
    assignedGroups.forEach(k => { delete t[k] });
    availableGroups.value = t;
}

function edit(user: User) {
    // console.log(JSON.stringify(user, null, 2));
    editUser.value = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        admin: !!user.customClaims.admin,
        privileges: { ...user.customClaims.privileges }
    }

    refreshAvailableGroups();
}

const selectedGroup = ref()
const selectedLevel = ref()

function addGroup() {
    if (selectedGroup.value && selectedLevel.value) {
        editUser.value.privileges[selectedGroup.value] = selectedLevel.value;
        refreshAvailableGroups();
    }
    selectedGroup.value = null;
    selectedLevel.value = null;
}

function deleteGroup(groupId: string) {
    delete editUser.value.privileges[groupId];
    refreshAvailableGroups();
}

function save() {
    const functions = getFunctions();
    const addMessage = httpsCallable(functions, 'setUserPrivileges');
    addMessage({
        admin: editUser.value.admin,
        email: editUser.value.email,
        privileges: editUser.value.privileges
    }).then((result) => {
        alert("User privileges saved");
    }).catch(e => {
        alert('Error savung user privileges: ' + e.message);
        console.log(e);
    }).finally(() => editUser.value = null);

    // return fetch(
    //     'https://us-central1-fao-ferm.cloudfunctions.net/setUserPrivileges',
    //     {
    //         method: 'POST',
    //         headers: {
    //             'Authorization': `Bearer ${authStore.user.accessToken}`,
    //         },
    //         body: JSON.stringify({ "data": { "email": "stefano.giaccio@gmail.com","privileges": { "Ed26caSgj8G96rU7pkgj": "admin" }, "admin": true } })
    //     }).then(response => {
    //         if (!response.ok) {
    //             return response.text().then(text => { throw new Error(text) })
    //         }
    //         return response.text();
    //     }).then(() => {
    //         // const uuidsArr: string[] = JSON.parse(uuids)
    //         // emit('done', uuidsArr.map((uuid, i) => ({
    //         //     siteName: (rows.value!)[i][(areaNameField.value as string)],
    //         //     uuid: uuid,
    //         //     activities: null
    //         // })));
    //         // selectedFile.value = null;
    //         // alert(`Files uploaded with UUIDs ${uuidsArr}\n\nPlease remember to click "Save and close" otherwise the data will be lost.`);
    //         alert("User privileges saved");
    //     }).catch(e => {
    //         alert('Error savung user privileges: ' + e.message);
    //         console.log(e);
    //     }).finally(() => editUser.value = null);



    // https://us-central1-fao-ferm.cloudfunctions.net/setUserPrivileges
    // {"data":{"email":"cane.bastonato@icloud.com","privileges":{"Ed26caSgj8G96rU7pkgj":"admin"},"admin":false}}
}
</script>

<template>
    <TabTemplate title="Users">
        <!-- <div class="sm:flex sm:items-center">
                <div class="sm:flex-auto">
                    <h1 class="text-xl font-semibold text-gray-900">Users</h1>
                    <p class="mt-2 text-sm text-gray-700">A list of all the users in your account including their name, title, email and role.</p>
                </div>
                <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button type="button"
                            class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">Add user</button>
                </div>
            </div> -->
        <div class="mt-8 flex flex-col">
            <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <table class="min-w-full divide-y divide-gray-300">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col"
                                        class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                                    <th scope="col"
                                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created</th>
                                    <th scope="col"
                                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th scope="col"
                                        class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span class="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 bg-white">
                                <tr v-for="user in users"
                                    :key="user.email">
                                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                        <div class="flex items-center">
                                            <div class="h-10 w-10 flex-shrink-0">
                                                <img v-if="user.photoUrl"
                                                     class="h-10 w-10 rounded-full"
                                                     :src="user.photoUrl"
                                                     alt="" />
                                                <span v-else
                                                      class="inline-block h-10 w-10 overflow-hidden rounded-full bg-gray-600">
                                                    <svg class="h-full w-full text-gray-300"
                                                         fill="currentColor"
                                                         viewBox="0 0 24 24">
                                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                </span>

                                            </div>
                                            <div class="ml-4">
                                                <div :class="[user.displayName ? 'text-gray-900' : 'text-gray-600 italic', 'font-medium']">{{ user.displayName || 'No name provided' }}</div>
                                                <div class="text-gray-500">{{ user.email }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <div class="text-gray-900">{{ user.metadata.creationTime.substring(0, 16) }}</div>
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <span v-if="!user.disabled"
                                              class="inline-flex rounded-full bg-green-300 px-2 text-xs font-semibold leading-5 text-green-900">Enabled</span>
                                        <span v-else
                                              class="inline-flex rounded-full bg-red-300 px-2 text-xs font-semibold leading-5 text-green-900">Disabled</span>
                                    </td>
                                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <button @click="edit(user)"
                                                class="text-indigo-600 hover:text-indigo-900">Edit<span class="sr-only">, {{ user.displayName }}</span></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </TabTemplate>



    <!-- User edit dialog -->
    <TransitionRoot as="template"
                    :show="!!editUser">
        <Dialog as="div"
                class="relative z-10"
                @close="editUser = null">
            <TransitionChild as="template"
                             enter="ease-out duration-300"
                             enter-from="opacity-0"
                             enter-to="opacity-100"
                             leave="ease-in duration-200"
                             leave-from="opacity-100"
                             leave-to="opacity-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 z-10 overflow-y-auto">
                <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <TransitionChild as="template"
                                     enter="ease-out duration-300"
                                     enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                     enter-to="opacity-100 translate-y-0 sm:scale-100"
                                     leave="ease-in duration-200"
                                     leave-from="opacity-100 translate-y-0 sm:scale-100"
                                     leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                        <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                            <div v-if="editUser"
                                 class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div class="mt-3 text-center sm:mt-0 sm:text-left">
                                    <DialogTitle as="h3"
                                                 class="text-lg font-medium leading-6 text-gray-900">Edit user {{ editUser.displayName || editUser.email }}</DialogTitle>
                                    <div class="mt-2">
                                        <!-- <p class="text-sm text-gray-500">Are you sure you want to deactivate your account? All of your data will be permanently removed. This action cannot be undone.</p> -->
                                        <SwitchGroup as="div"
                                                     class="mt-4 flex items-center">
                                            <Switch v-model="editUser.admin"
                                                    :class="[editUser.admin ? 'bg-indigo-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                      :class="[editUser.admin ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span"
                                                         class="ml-3">
                                                <span class="cursor-pointer text-sm font-medium text-gray-900">Administrator</span>
                                            </SwitchLabel>
                                        </SwitchGroup>
                                    </div>

                                    <div class="mt-2">
                                        <div class="px-6 lg:px-8">
                                            <div class="mt-8 flow-root">
                                                <div class="-my-2 -mx-6 overflow-x-auto lg:-mx-8">
                                                    <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                                        <table class="min-w-full divide-y divide-gray-300">
                                                            <thead>
                                                                <tr>
                                                                    <th scope="col"
                                                                        class="whitespace-nowrap py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Group</th>
                                                                    <th scope="col"
                                                                        class="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900">Level</th>
                                                                    <th scope="col"
                                                                        class="relative whitespace-nowrap py-3.5 pl-3 pr-6 sm:pr-0">
                                                                        <span class="sr-only">Edit</span>
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody class="divide-y divide-gray-200 bg-white">
                                                                <tr v-for="(level, group) in editUser.privileges"
                                                                    :key="group">
                                                                    <td class="whitespace-nowrap py-2 pl-6 pr-3 text-sm text-gray-500 sm:pl-0">{{ allGroups[group] }}</td>
                                                                    <td class="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900">{{ level }}</td>
                                                                    <td class="relative whitespace-nowrap py-2 pl-3 pr-6 text-right text-sm font-medium sm:pr-0">
                                                                        <span @click="deleteGroup(group)"
                                                                              class="cursor-pointer text-indigo-600 hover:text-indigo-900">Delete<span class="sr-only">, {{ allGroups[group] }}</span></span>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- <p v-for="(level, group) in editUser.privileges">
                                            {{ allGroups[group] }}: {{ level }}
                                            <button @click="deleteGroup(group)">[delete]</button>
                                        </p> -->
                                        </div>
                                    </div>
                                </div>

                                <div class="mt-6 py-3 px-4 bg-gray-100 border border-1 border-gray-300 rounded rounded-lg">
                                    <!-- {{ JSON.stringify(editUser.privileges, null, 2) }} -->
                                    <h1 class="text-lg font-semibold">Add group:</h1>
                                    <div class="mt-3">
                                        <label for="group"
                                               class="block text-sm font-medium text-gray-700">Group</label>
                                        <select v-model="selectedGroup"
                                                id="group"
                                                name="group"
                                                class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                                            <option v-for="[group, name] in Object.entries(availableGroups)"
                                                    :value="group">{{ name }}</option>
                                        </select>
                                    </div>
                                    <div class="mt-3">
                                        <label for="level"
                                               class="block text-sm font-medium text-gray-700">Level</label>
                                        <select v-model="selectedLevel"
                                                id="level"
                                                name="level"
                                                class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                                            <option value="guest">Guest</option>
                                            <option value="editor">Editor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <button @click="addGroup"
                                            type="button"
                                            class="mt-6 inline-flex items-center rounded border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Add</button>
                                </div>
                            </div>
                            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button type="button"
                                        class="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                        @click="save()">Save</button>
                                <button type="button"
                                        class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        @click="editUser = null"
                                        ref="cancelButtonRef">Cancel</button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>




<!-- 
(defn user-details [user]
  (with-let [custom-claims  (:customClaims user)
             admin          (r/atom (or (:admin custom-claims) false))
             privileges     (r/atom (:privileges custom-claims))
             group-menu     (r/atom (try
                                      (apply (partial dissoc @group-list) (keys @privileges))
                                      (catch js/Error _ @group-list)))
             selected-group (r/atom (if (seq @group-menu) (-> @group-menu first key) nil))
             selected-role  (r/atom "guest")
             user-data      (r/atom nil)
             _              (.then (load-user-registration-info (:uid user))
                                   (fn [user]
                                     (reset! user-data (js->clj (.data user) :keywordize-keys true))))]
    [:div
     [:div
      {:class "mb-6 mt-6"}
      [:input {:type "checkbox"
               :class "mr-2"
               :id "admin"
               :name "admin"
               :checked @admin
               :on-change #(swap! admin not)}]
      [:label {:for "admin"} "Admin"]]
     (doall (try
              (for [[group privilege] (into [] @privileges)]
                [:div {:key group} (get-group-name group) ": " privilege " "
                 [:span {:class "text-red-600 cursor-pointer hover:text-red-700"
                         :on-click (fn []
                                     (unassign privileges group)
                                     (reset! group-menu (apply (partial dissoc @group-list) (keys @privileges)))
                                     (when (seq @group-menu)
                                       (reset! selected-group (-> @group-menu first key))))} "[delete]"]])
              (catch js/Error _ [:div {:class "text-red-600 font-bold"} "Error getting user's privileges - please reassing them"])))
     (when (seq @group-menu) [:<>
                              [:select
                               {:class "mr-6 max-w-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                                :value     @selected-group
                                :on-change #(reset! selected-group (-> % .-target .-value keyword))}
                               (doall (for [group @group-menu]
                                        [:option {:key (key group)
                                                  :value (key group)} (val group)]))]
                              [:select
                               {:class "mr-6 max-w-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                                :value @selected-role
                                :on-change #(reset! selected-role (-> % .-target .-value))}
                               [:option {:value "guest"}  "guest"]
                               [:option {:value "editor"} "editor"]
                               [:option {:value "admin"}  "admin"]]
                              [:button {:type "button"
                                        :class "my-6 inline-flex items-center px-4 py-1 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        :on-click (fn []
                                                    (swap! privileges assoc @selected-group @selected-role)
                                                    (swap! group-menu dissoc @selected-group)
                                                    (when (seq @group-menu)
                                                      (reset! selected-group (-> @group-menu first key)))
                                                    (reset! selected-role "guest"))}
                               "Add "]])

     (when @user-data
       [:div
        [:p [:span {:class "font-bold"} "Institution: "] (:institution @user-data)]
        [:p [:span {:class "font-bold"} "Purpose: "] (:purpose @user-data)]])

     [:div
      [:button {:type "button"
                :class "my-6 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                :on-click (fn []
                            (-> (set-user-privileges (:email user) @privileges @admin)
                                (.then (fn []
                                         (js/alert "Privileges assigned")
                                         (reset! modal-content nil)))
                                (.catch #(js/alert (str "Error assigning privileges" %)))))}
       "Save"]]]))
 -->
